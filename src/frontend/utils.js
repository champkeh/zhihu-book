export async function request(payload) {
    const resp = await fetch('/api/proxy', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json'
        },
    })
    return resp.json()
}
