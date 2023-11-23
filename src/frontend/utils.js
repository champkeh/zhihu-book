export async function request(payload, parse = true) {
    const resp = await fetch('/api/proxy', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json'
        },
    })

    if (parse) {
        const respContentType = resp.headers.get('Content-Type')
        if (respContentType === 'application/json') {
            return resp.json()
        } else {
            return resp.text()
        }
    } else {
        return resp
    }
}

export async function sleep(duration) {
    return new Promise(resolve => {
        setTimeout(resolve, duration)
    })
}

/**
 * 打包 zip 文件
 * @param {string} filename
 * @param {string} content
 * @return {Promise<void>}
 */
async function zipFile(filename, content) {
    const zip = new JSZip()
    zip.file(filename, content)
    const blob = await zip.generateAsync({type: "blob"})
    saveAs(blob, `${filename}.zip`)
}

/**
 * 导出 html
 * @return {Promise<void>}
 */
export async function export2html(title, chapters) {
    const contentHtml = chapters.map(chapter => `<!-- ${chapter.title} -->\n${chapter.html}`).join('\n')
    const cssPaths = Array.from(new Set(chapters.flatMap(chapter => chapter.cssPaths)))
    const links = cssPaths.map(path => `<link rel="stylesheet" href="${path}">`).join('\n')
    let html = `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${title}</title>
    ${links}
    <style>img {max-width: 100%;}</style>
</head>
<body>
${contentHtml}
</body>
</html>
`
    await zipFile(title + '.html', html)
}
