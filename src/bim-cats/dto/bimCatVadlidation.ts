import * as Joi from 'joi';

export const id = Joi.object({
    id: Joi.string().empty('').length(24),
});

export const create = Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
});

export const update = Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
});
