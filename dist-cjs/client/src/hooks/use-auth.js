"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = useAuth;
const react_query_1 = require("@tanstack/react-query");
async function fetchUser() {
    const response = await fetch("/api/auth/user", {
        credentials: "include",
    });
    if (response.status === 401) {
        return null;
    }
    if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
    }
    return response.json();
}
async function logout() {
    window.location.href = "/api/logout";
}
function useAuth() {
    const queryClient = (0, react_query_1.useQueryClient)();
    const { data: user, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ["/api/auth/user"],
        queryFn: fetchUser,
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
    const logoutMutation = (0, react_query_1.useMutation)({
        mutationFn: logout,
        onSuccess: () => {
            queryClient.setQueryData(["/api/auth/user"], null);
        },
    });
    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        logout: logoutMutation.mutate,
        isLoggingOut: logoutMutation.isPending,
    };
}
