import {get, postForm, postFormData, postJSON, postQuery} from "../utils/request.ts";


export async function proxy(req: Request) {
    const {method, url, data, postType} = await req.json()
    const _method = method.toLowerCase()
    if (_method === 'get') {
        return get(url)
    } else if (_method === 'post') {
        if (postType === 'json') {
            return postJSON(url, data)
        } else if (postType === 'formData') {
            return postFormData(url, data)
        } else if (postType === 'query') {
            return postQuery(url, data)
        } else if (postType === 'form') {
            return postForm(url, data)
        }
    }
}
