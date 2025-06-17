"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
// Validation middleware
const validate = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log('🔍 [DEBUG VALIDATION] Валидация запроса:', {
                method: req.method,
                url: req.url,
                body: req.body,
                query: req.query,
                params: req.params,
            });
            yield schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            console.log('🔍 [DEBUG VALIDATION] Валидация прошла успешно');
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                }));
                console.error('🔍 [DEBUG VALIDATION] Ошибка валидации:', errors);
                next(new errors_1.BadRequestError(JSON.stringify(errors)));
            }
            else {
                console.error('🔍 [DEBUG VALIDATION] Неизвестная ошибка валидации:', error);
                next(error);
            }
        }
    });
};
exports.validate = validate;
