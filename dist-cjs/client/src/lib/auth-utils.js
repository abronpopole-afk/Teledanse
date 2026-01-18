"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUnauthorizedError = isUnauthorizedError;
exports.redirectToLogin = redirectToLogin;
function isUnauthorizedError(error) {
    return /^401: .*Unauthorized/.test(error.message);
}
// Redirect to login with a toast notification
function redirectToLogin(toast) {
    if (toast) {
        toast({
            title: "Unauthorized",
            description: "You are logged out. Logging in again...",
            variant: "destructive",
        });
    }
    setTimeout(() => {
        window.location.href = "/api/login";
    }, 500);
}
