import {FetchBuilder} from "@/builder";
import {basicExecutor} from "@/executors/basic";
import {auth} from "@/middlewares/request/auth";
import {bodyBuilder} from "@/middlewares/request/body";
import {retrier} from "@/middlewares/request/retrier";
import {urlBuilder} from "@/middlewares/request/url";
import {baseResponseMiddleware} from "@/middlewares/response/base";
import {responseBuffer} from "@/middlewares/response/buffer";
import {responseJson} from "@/middlewares/response/json";
import {responsePlainText} from "@/middlewares/response/plain";
import {responseVoid} from "@/middlewares/response/void";

export const makeFetch = FetchBuilder.from(basicExecutor())
    .applyMiddleware(retrier())
    .applyMiddleware(bodyBuilder())
    .applyMiddleware(urlBuilder())
    .applyMiddleware(auth())
    .applyMiddleware(baseResponseMiddleware())
    .applyMiddleware(responseJson())
    .applyMiddleware(responsePlainText())
    .applyMiddleware(responseBuffer())
    .applyMiddleware(responseVoid())
    .build();


