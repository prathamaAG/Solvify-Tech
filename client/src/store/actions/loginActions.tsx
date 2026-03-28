// Actions related to login
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

export const saveLogin = (content: any) => ({
    type: LOGIN,
    payload: {
        token: content.token,
        isAdmin: content.isAdmin,
        email: content.email,
        user_id: content.user_id,
        name: content.name
    }
});

export const logoutUser = () => ({
    type: LOGOUT
});
