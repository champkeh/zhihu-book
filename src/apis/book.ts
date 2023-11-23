import {get, postForm, postFormData, postJSON, postQuery} from "../utils/request.ts";


export async function proxy(req: Request) {
    const {method, url, data, postType, cookie} = await req.json()
    const _method = method.toLowerCase()
    if (_method === 'get') {
        return get(url, {}, {cookie: cookie})
    } else if (_method === 'post') {
        if (postType === 'json') {
            return postJSON(url, data, {cookie: cookie})
        } else if (postType === 'formData') {
            return postFormData(url, data, {cookie: cookie})
        } else if (postType === 'query') {
            return postQuery(url, data, {cookie: cookie})
        } else if (postType === 'form') {
            return postForm(url, data, {cookie: cookie})
        } else {
            throw new Error(`postType: ${postType} 不支持`)
        }
    } else {
        throw new Error(`method: ${_method} 不支持`)
    }
}
