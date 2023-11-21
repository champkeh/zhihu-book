const crypto = require('crypto')

const clientId = '5774b305d2ae4469a2c9258956ea48'
const bookId = '119577471'
const chapterUid = '1054090328193302528'

function signPayload(payload) {
    const e = crypto.createHmac("sha1", "key")
    for (const value of payload) {
        e.update(value)
    }
    return e.digest("hex")
}

const transKey = 'etIa8FDeLOKKw0q91Ahtr8+Nn0gsR8NZ1kWE0T3KnrUjNhoUgBR7AuVtbq+tkXyXD4MtKYjVAmLmsU9xUnWdcyqRD8D3iO7RS+FygXl/pQ5bKFOtyL1owb6ZhfQAkLRUJ/O65syW5/9kULcDGS363PUSdOpgHI/MaUkJyJquCOI='
const sign = signPayload([chapterUid, transKey, '1700530954464', clientId, 'E48FBEA6AACC8177E10AF1190421E92B'])
console.log(sign)
// 1001cc21f1525ebae6ab379d660dbfcf77725a9c
