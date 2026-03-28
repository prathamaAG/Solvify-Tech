import { apiBase, cancelCall, deleteCall, getCall, postCall, postFormDataCall, putCall } from "../../constants";
import { commonService } from "../common";

const getAPICall = async (apiName: string, value: any = ""): Promise<any> => {
    if (commonService.getAPIFlag(apiName)) {
        return await cancelCall();
    } else {
        commonService.resetAPIFlag(apiName, true);
        if (!apiBase[apiName]) {
            console.error(`API endpoint not found for key: ${apiName}`);
            return { status: 0, message: "Invalid API request" };
        }
        // console.log("api:", apiBase[apiName] + value);
        return await getCall(apiBase[apiName] + value);
    }
};

const postAPICall = async (apiName: string, value: any): Promise<any> => {
    if (commonService.getAPIFlag(apiName)) {
        return await cancelCall();
    } else {
        commonService.resetAPIFlag(apiName, true);
        return await postCall(apiBase[apiName], JSON.stringify(value));
    }
};

const postFormDataAPICall = async (apiName: string, value: any): Promise<any> => {
    if (commonService.getAPIFlag(apiName)) {
        return await cancelCall();
    } else {
        commonService.resetAPIFlag(apiName, true);
        return await postFormDataCall(apiBase[apiName], value);
    }
};

const deleteAPICall = async (apiName: string, value: any): Promise<any> => {
    if (commonService.getAPIFlag(apiName)) {
        return await cancelCall();
    }
    else {
        commonService.resetAPIFlag(apiName, true);
        return await deleteCall(apiBase[apiName] + value);
    }
};

const putAPICall = async (apiName: string, value: any): Promise<any> => {
    if (commonService.getAPIFlag(apiName)) {
        return await cancelCall();
    }
    else {
        commonService.resetAPIFlag(apiName, true);
        return await putCall(apiBase[apiName], JSON.stringify(value));
    }
};

export const apiService = {
    GetAPICall: getAPICall,
    PostAPICall: postAPICall,
    PostFormDataAPICall: postFormDataAPICall,
    DeleteAPICall: deleteAPICall,
    PutAPICall: putAPICall
};