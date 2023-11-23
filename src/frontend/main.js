import CryptoJS from 'https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/+esm'
import crypto from 'https://cdn.jsdelivr.net/npm/crypto-browserify@3.12.0/+esm'
import {request, sleep, export2html} from './utils.js'

const {Buffer} = window.browserCrypto

const API_BASE = 'https://www.zhihu.com/api/'
const clientId = '5774b305d2ae4469a2c9258956ea48'

// 获取章节目录
async function getChapters(bookId, cookie) {
    const payload = {
        method: 'get',
        url: `${API_BASE}v3/books/${bookId}/chapters`,
        cookie: cookie,
    }
    const resp = await request(payload)
    return resp.updated
}

// 获取密钥
async function download_info(bookId, chapterUid, cookie) {
    const payload = {
        method: 'get',
        url: `${API_BASE}v3/books/${bookId}/chapters/${chapterUid}/download_info`,
        cookie: cookie,
    }
    return await request(payload)
}

// 获取文件路径
async function download(bookId, chapterUid, transKey, keyHash, cookie) {
    const timestamp = Number(new Date)
    const sign = signPayload([chapterUid, transKey, clientId, timestamp.toString(), keyHash])
    const payload = {
        client_id: clientId,
        key_hash: keyHash,
        signature: sign,
        timestamp: timestamp,
        trans_key: transKey,
    }
    return request({
        method: 'post',
        url: `${API_BASE}v3/books/${bookId}/chapters/${chapterUid}/download`,
        data: payload,
        postType: 'form',
        cookie: cookie,
    })
}

// 获取本地key
function getTransKey(key) {
    const _transKey = Array.from({length: 16}).map(() => Math.floor(16 * Math.random()).toString(16).toUpperCase()).join("")
    const body = Buffer.alloc(128 - _transKey.length)
    const buf = Buffer.concat([body, Buffer.from(_transKey)])
    const transKey = crypto.publicEncrypt({
        key: key,
        padding: crypto.constants.RSA_NO_PADDING || 3,
    }, buf).toString('base64')
    return [transKey, _transKey]
}

// 计算签名
function signPayload(payload) {
    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA1, "key");
    for (const value of payload) {
        hmac.update(value);
    }
    const hash = hmac.finalize();
    return CryptoJS.enc.Hex.stringify(hash)
}

// 解密
function l(key, buffer, encoding) {
    let iv, data;
    if (typeof buffer === 'string') {
        let s = Buffer.from(buffer, "base64");
        iv = Buffer.alloc(16)
        data = Buffer.alloc(s.length - 16)
        s.copy(iv, 0, 0, 16)
        s.copy(data, 0, 16)
    } else {
        if (!(buffer instanceof Buffer)) {
            return ""
        }
        iv = buffer.slice(0, 16)
        data = buffer.slice(16)
    }
    return window.browserCrypto.createDecipheriv("aes-128-cfb8", key, iv).update(data, null, encoding)
}

// 下载 html 内容
function p(bookId, chapterUid, htmlPath, key, cookie) {
    const payload = {
        method: 'get',
        url: htmlPath,
        cookie: cookie,
    }
    return request(payload, false).then(resp => {
        return key ? resp.blob() : resp.text()
    }).then(content => {
        return key
            ? new Promise(resolve => {
                const reader = new window.FileReader()
                reader.readAsArrayBuffer(content)
                reader.onload = () => {
                    const buffer = Buffer.from(reader.result)
                    const text = l(key, buffer, 'utf8')
                    resolve(text)
                }
            })
            : content
    })
}

async function downloadChapter(bookId, chapterUid, cookie) {
    const {key, key_hash} = await download_info(bookId, chapterUid, cookie)
    const [transKey, _transKey] = getTransKey(key)
    const resp = await download(bookId, chapterUid, transKey, key_hash, cookie)
    if (resp.error) {
        throw new Error(resp.error.message)
    }
    const k = l(_transKey, resp.key, "utf8")
    const html = await p(bookId, chapterUid, resp.html_path, k, cookie)
    return [html, resp.css_path]
}

async function downloadBook(bookId, cookie) {
    const results = []
    document.querySelector('.download').classList.add('disabled')
    const chapters = await getChapters(bookId, cookie)
    document.querySelector('.download').textContent = `0/${chapters.length}`
    let count = 0
    for (const chapter of chapters) {
        try {
            const [html, cssPaths] = await downloadChapter(bookId, chapter.chapter_uid, cookie)
            results.push({
                html: html,
                title: chapter.title,
                cssPaths: cssPaths,
            })
            document.querySelector('.download').textContent = `${++count}/${chapters.length}`
            await sleep(1000)
        } catch (e) {
            alert(e.message)
            break
        }
    }
    document.querySelector('.download').classList.remove('disabled')
    document.querySelector('.download').textContent = '下载'
    return results
}


document.querySelector('form').addEventListener('submit', async (evt) => {
    evt.preventDefault()

    const formData = new FormData(evt.target)
    const bookId = formData.get('bookId').trim()
    const cookie = (formData.get('cookie') || '').trim()

    if (bookId) {
        const resp = await downloadBook(bookId, cookie)
        await export2html(bookId, resp)
    } else {
        alert('URL没有匹配到 bookId')
    }
})
