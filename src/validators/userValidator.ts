import Joi from 'joi';

export const createUserSchema = Joi.object({
    name: Joi.string()
        .trim()
        .custom((value, helpers) => {
            // Tar bort extra mellanslag mellan ord
            return value.replace(/\s+/g, ' ');
        }, 'Trim internal spaces')
        .min(3)
        .max(50)
        .required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
});

export const loginUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});
