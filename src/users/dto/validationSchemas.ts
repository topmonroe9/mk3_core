import * as Joi from 'joi';
import { Role } from '@interfaces/role.enum';

const options = { abortEarly: false, stripUnknown: true };

export const authenticate = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
}).options(options);

export const register = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    bimCatSelection: Joi.string().required(),
}).options(options);

export const revokeToken = Joi.object({
    token: Joi.string().empty(''),
});

export const verifyEmail = Joi.object({
    token: Joi.string().required(),
});

export const forgotPassword = Joi.object({
    email: Joi.string().email().required(),
});

export const validateResetToken = Joi.object({
    token: Joi.string().required(),
});

export const resetPassword = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
});

export const create = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
});

export const update = Joi.object({
    firstName: Joi.string().empty(''),
    lastName: Joi.string().empty(''),
    email: Joi.string().email().empty(''),
    password: Joi.string().min(6).empty(''),
    confirmPassword: Joi.string().valid(Joi.ref('password')).empty(''),
    allowedBimCat: Joi.string(),
    pluginAccessGranted: Joi.boolean(),
    suspended: Joi.bool(),
    roles: Joi.array().items(Joi.string().valid(...Object.values(Role))),
});
