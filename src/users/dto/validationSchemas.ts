import * as Joi from "joi";

const options = {abortEarly: false, stripUnknown: true}

export const authenticate = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
}).options(options);

export const register = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
}).options(options);

export const revokeToken = Joi.object({
    token: Joi.string().empty('')
});

export const verifyEmail = Joi.object({
    token: Joi.string().required()
});

export const forgotPassword = Joi.object({
    email: Joi.string().email().required()
});

export const validateResetToken = Joi.object({
    token: Joi.string().required()
});

export const resetPassword = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
});

export const create = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    // role: Joi.string().valid(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.User).required()
});

export const update = {
    firstName: Joi.string().empty(''),
    lastName: Joi.string().empty(''),
    email: Joi.string().email().empty(''),
    password: Joi.string().min(6).empty(''),
    confirmPassword: Joi.string().valid(Joi.ref('password')).empty(''),
    allowedBimCat: Joi.string(),
    suspended: Joi.bool(),
    // role = Joi.string().valid(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Employee, RoleEnum.Outsource, RoleEnum.Suspended).empty('')
};
