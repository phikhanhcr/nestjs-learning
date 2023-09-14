"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PostModule = void 0;
var common_1 = require("@nestjs/common");
var post_service_1 = require("./post.service");
var post_controller_1 = require("./post.controller");
var PostModule = /** @class */ (function () {
    function PostModule() {
    }
    PostModule_1 = PostModule;
    // dynamic module
    PostModule.register = function (options) {
        return {
            module: PostModule_1,
            controllers: [post_controller_1.PostController],
            providers: [
                post_service_1.PostService,
                {
                    provide: 'OPTIONS',
                    useValue: options
                },
            ],
            exports: [post_service_1.PostService]
        };
    };
    var PostModule_1;
    PostModule = PostModule_1 = __decorate([
        common_1.Module({})
    ], PostModule);
    return PostModule;
}());
exports.PostModule = PostModule;
