import buffer from 'https://cdn.jsdelivr.net/npm/buffer@6.0.3/+esm'
import CryptoJS from 'https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/+esm'
import crypto from 'https://cdn.jsdelivr.net/npm/crypto-browserify@3.12.0/+esm'
import {request} from './utils.js'

// console.log(crypto)

const clientId = '5774b305d2ae4469a2c9258956ea48'
const bookId = '119577471'
const chapterUid = '1054090328193302528'
const ApiBase = 'https://www.zhihu.com/api/'



// 获取密钥
async function download_info(bookId, chapterUid) {
    const payload = {
        method: 'get',
        url: `${ApiBase}v3/books/${bookId}/chapters/${chapterUid}/download_info`
    }
    return await request(payload)
}

async function download(bookId, chapterUid, key, keyHash) {
    const timestamp = Number(new Date)
    const transKey = getTransKey(key)
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
        url: `${ApiBase}v3/books/${bookId}/chapters/${chapterUid}/download`,
        data: payload,
        postType: 'form',
    })
}

function getTransKey(key) {
    const _transKey = Array.from({length: 16}).map(() => Math.floor(16 * Math.random()).toString(16).toUpperCase()).join("")
    const body = buffer.Buffer.alloc(128 - _transKey.length)
    const buf = buffer.Buffer.concat([body, buffer.Buffer.from(_transKey)])
    return crypto.publicEncrypt({
        key: key,
        padding: crypto.constants.RSA_NO_PADDING || 3,
    }, buf).toString('base64')
}

function signPayload(payload) {
    // const e = crypto.createHmac("sha1", "key")
    // for (const value of payload) {
    //     e.update(value)
    // }
    // return e.digest("hex")

    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA1, "key");
    for (const value of payload) {
        hmac.update(value);
    }
    const hash = hmac.finalize();
    return CryptoJS.enc.Hex.stringify(hash)
}


async function run(bookId, chapterUid) {
    const {key, key_hash} = await download_info(bookId, chapterUid)
    const resp = await download(bookId, chapterUid, key, key_hash)
    console.log(resp)
}

// run(bookId, chapterUid)

const transKey = 'etIa8FDeLOKKw0q91Ahtr8+Nn0gsR8NZ1kWE0T3KnrUjNhoUgBR7AuVtbq+tkXyXD4MtKYjVAmLmsU9xUnWdcyqRD8D3iO7RS+FygXl/pQ5bKFOtyL1owb6ZhfQAkLRUJ/O65syW5/9kULcDGS363PUSdOpgHI/MaUkJyJquCOI='
const sign = signPayload([chapterUid, transKey, '1700530954464', clientId, 'E48FBEA6AACC8177E10AF1190421E92B'])
console.log(sign)
// 1001cc21f1525ebae6ab379d660dbfcf77725a9c
// c3c715e6c601edd687f23139881b802f3e1e4f5e
