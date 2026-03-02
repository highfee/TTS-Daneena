/**
 * apiFetch — a smart fetch wrapper that:
 *  1. Injects Authorization header from the auth store
 *  2. On 401, silently calls POST /api/auth/refresh (httpOnly cookie sent automatically)
 *  3. Updates the store with the new access token and retries the original request
 *  4. If the refresh also fails, logs the user out and re-throws
 */

import { useAuthStore } from "@/store/use-auth-store"

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

/** Drain all queued requests after a refresh attempt */
function resolveQueue(token: string | null) {
    refreshQueue.forEach((resolve) => resolve(token))
    refreshQueue = []
}

export async function apiFetch(
    input: RequestInfo | URL,
    init: RequestInit = {}
): Promise<Response> {
    const { user, refreshAccessToken, logout } = useAuthStore.getState()

    // Inject auth header
    const headers = new Headers(init.headers)
    if (user?.accessToken) {
        headers.set("Authorization", `Bearer ${user.accessToken}`)
    }

    const response = await fetch(input, { ...init, headers, credentials: "include" })

    if (response.status !== 401) {
        return response
    }

    // --- 401 received — attempt silent refresh ---

    if (isRefreshing) {
        // Another refresh is already in flight — queue this request until it resolves
        return new Promise((resolve, reject) => {
            refreshQueue.push(async (newToken) => {
                if (!newToken) {
                    reject(new Error("Session expired. Please log in again."))
                    return
                }
                const retryHeaders = new Headers(init.headers)
                retryHeaders.set("Authorization", `Bearer ${newToken}`)
                resolve(fetch(input, { ...init, headers: retryHeaders, credentials: "include" }))
            })
        })
    }

    isRefreshing = true

    try {
        const newToken = await refreshAccessToken()

        if (!newToken) {
            resolveQueue(null)
            logout()
            throw new Error("Session expired. Please log in again.")
        }

        resolveQueue(newToken)

        // Retry the original request with the new token
        const retryHeaders = new Headers(init.headers)
        retryHeaders.set("Authorization", `Bearer ${newToken}`)
        return fetch(input, { ...init, headers: retryHeaders, credentials: "include" })
    } catch (err) {
        resolveQueue(null)
        logout()
        throw err
    } finally {
        isRefreshing = false
    }
}
