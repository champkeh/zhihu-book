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
