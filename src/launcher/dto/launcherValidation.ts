import * as Joi from "joi";

export const create = Joi.object({
    version: Joi.string().required(),
    downloadLink: Joi.string().required(),

});
