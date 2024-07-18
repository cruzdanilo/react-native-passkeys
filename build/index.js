// Import the native module. On web, it will be resolved to ReactNativePasskeys.web.ts
// and on native platforms to ReactNativePasskeys.ts
import ReactNativePasskeysModule from './ReactNativePasskeysModule';
export function isSupported() {
    return ReactNativePasskeysModule.isSupported();
}
export function isAutoFillAvalilable() {
    return ReactNativePasskeysModule.isAutoFillAvalilable();
}
export async function create(request) {
    return await ReactNativePasskeysModule.create(request);
}
export async function get(request) {
    return ReactNativePasskeysModule.get(request);
}
//# sourceMappingURL=index.js.map