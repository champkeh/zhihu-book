import {proxy} from "./apis/book.ts";

type APIHandler = (req: Request) => Response | Promise<Response>

const config: Record<string, APIHandler> = {
    '/api/proxy': proxy,
}

/**
 * 处理前端api请求
 * @param api
 * @param req
 */
export function routeApi(api: string, req: Request) {
    if (api in config) {
        return config[api](req)
    } else {
        return new Response(null, {
            status: 502,
        })
    }
}
