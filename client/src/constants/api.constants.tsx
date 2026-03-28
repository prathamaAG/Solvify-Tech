import { store } from '../store/store';
import { apiBase } from './api-base.constants';

const code = [
    { key: 100, value: "Continue" },
    { key: 101, value: "101" },

    { key: 200, value: "OK" },
    { key: 201, value: "Created" },
    { key: 202, value: "Accepted" },
    { key: 203, value: "Non-Authoritative Information" },
    { key: 204, value: "No Content" },
    { key: 205, value: "Reset Content" },
    { key: 206, value: "Partial Content" },

    { key: 300, value: "Multiple Choices" },
    { key: 301, value: "Moved Permanently" },
    { key: 302, value: "Found" },
    { key: 303, value: "See Other" },
    { key: 304, value: "Not Modified" },
    { key: 305, value: "Use Proxy" },
    { key: 306, value: "(Unused)" },
    { key: 307, value: "Temporary Redirect" },

    { key: 400, value: "Bad Request" },
    { key: 401, value: "Unauthorized" },
    { key: 402, value: "Payment Required" },
    { key: 403, value: "Forbidden" },
    { key: 404, value: "Not Found" },
    { key: 405, value: "Method Not Allowed" },
    { key: 406, value: "Not Acceptable" },
    { key: 407, value: "Proxy Authentication Required" },
    { key: 408, value: "Request Timeout" },
    { key: 409, value: "Conflict" },
    { key: 410, value: "Gone" },
    { key: 411, value: "Length Required" },
    { key: 412, value: "Precondition Failed" },
    { key: 413, value: "Request Entity Too Large" },
    { key: 414, value: "Request-URI Too Long" },
    { key: 415, value: "Unsupported Media Type" },
    { key: 416, value: "Requested Range Not Satisfiable" },
    { key: 417, value: "Expectation Failed" },

    { key: 500, value: "Internal Server Error" },
    { key: 501, value: "Not Implemented" },
    { key: 502, value: "Bad Gateway" },
    { key: 503, value: "Service Unavailable" },
    { key: 504, value: "Gateway Timeout" },
    { key: 505, value: "HTTP Version Not Supported" }];

const responseCall = async (response: any) => {
    let message = "";
    code.every((element: any) => {
        if (element.key === response.status) {
            message = element.value;
            return false;
        }
        return true;
    });

    if (response.status === 200) {
        const responses = JSON.parse(await response.text());
        return { status: 1, message: responses.message || message, data: responses.data };
    } else if (response.status === 201) {
        const responses = JSON.parse(await response.text());
        return {
            status: 1,
            message: responses.message || message,
            data: responses.data,
        };
    } else {
        const errorResponse = JSON.parse(await response.text());
        return {
            status: 0,
            message: errorResponse.message || message,
            data: null,
        };
    }
};

const basicAuthUrls = [
    apiBase.userLogin,
    apiBase.userSignUp,
    apiBase.verifyResendEmail,
    apiBase.verifyEmail,
    apiBase.forgotPassword,
    apiBase.resetPassword
];

const getToken = (url: string, headers: any) => {
    try {
        const state = store.getState();
        const isBasicUrl = basicAuthUrls.indexOf(url) !== -1;
        if (isBasicUrl) {
            return headers;
        } else {
            return {
                ...headers,
                Authorization: "Bearer " + state.login.token
            };
        }
    } catch (error: any) {
        console.log(error);
        return headers;
    }
};

export const getCall = async (url: any) => {
    try {
        const response = await fetch(encodeURI(apiBase.apiUrl + url), {
            method: 'GET',
            headers: getToken(url, {}),
        });
        return responseCall(response);
    } catch (error: any) {
        return {
            "status": 0,
            "message": error.message
        };
    }
};

export const postCall = async (url: any, data: any) => {
    try {
        const response = await fetch(encodeURI(apiBase.apiUrl + url), {
            method: 'POST',
            headers: getToken(url, {
                'Accept': 'application/json',
                "Content-Type": "application/json"
            }),
            body: data
        });
        return responseCall(response);
    } catch (error: any) {
        return {
            "status": 0,
            "message": error.message
        };
    }
};

export const postFormDataCall = async (url: any, data: any) => {
    try {
        const response = await fetch(encodeURI(apiBase.apiUrl + url), {
            method: 'POST',
            headers: getToken(url, {}),
            body: data
        });
        return responseCall(response);
    } catch (error: any) {
        return {
            "status": 0,
            "message": error.message
        };
    }
};

export const deleteCall = async (url: any) => {
    try {
        const response = await fetch(encodeURI(apiBase.apiUrl + url), {
            method: 'DELETE',
            headers: getToken(url, {
                'Accept': 'application/json',
                "Content-Type": "application/json"
            }),
        });
        return responseCall(response);
    } catch (error: any) {
        return {
            "status": 0,
            "message": error.message
        };
    }
};

export const putCall = async (url: any, data: any) => {
    try {
        const response = await fetch(encodeURI(apiBase.apiUrl + url), {
            method: 'PUT',
            headers: getToken(url, {
                'Accept': 'application/json',
                "Content-Type": "application/json"
            }),
            body: data
        });
        return responseCall(response);
    } catch (error: any) {
        return {
            "status": 0,
            "message": error.message
        };
    }
};

export const cancelCall = async () => {
    return {
        status: -1,
        message: "API call is in progress"
    };
};