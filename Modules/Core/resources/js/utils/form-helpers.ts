import { useTranslation } from 'react-i18next';

/**
 * Translates form field labels, placeholders, and validation messages
 *
 * @param fields Object containing field configurations
 * @returns Translated field configurations
 */
export function useTranslatedFields<T extends Record<string, any>>(fields: T): T {
    const { t } = useTranslation(['common', 'fields', 'validation']);

    const translateField = (field: unknown): unknown => {
        if (!field) return field;

        const result = { ...field };

        // Translate label if it exists
        if (field.label) {
            result.label = t(`fields:${field.label}`, field.label);
        }

        // Translate placeholder if it exists
        if (field.placeholder) {
            result.placeholder = t(`fields:${field.placeholder}`, field.placeholder);
        }

        // Translate help text if it exists
        if (field.helpText) {
            result.helpText = t(`fields:${field.helpText}`, field.helpText);
        }

        // Translate validation messages if they exist
        if (field.validation) {
            const validation = { ...field.validation };

            // Translate error messages
            if (validation.messages) {
                const messages = { ...validation.messages };
                Object.keys(messages).forEach((key) => {
                    messages[key] = t(`validation:${messages[key]}`, messages[key]);
                });
                validation.messages = messages;
            }

            result.validation = validation;
        }

        // Translate options if they exist (for select, radio, checkbox)
        if (field.options && Array.isArray(field.options)) {
            result.options = field.options.map((option: any) => {
                if (typeof option === 'object' && option !== null) {
                    return {
                        ...option,
                        label: t(`fields:${option.label}`, option.label),
                    };
                }
                return option;
            });
        }

        return result;
    };

    // Create a new object with translated fields
    const translatedFields: Record<string, any> = {};

    Object.keys(fields).forEach((key) => {
        translatedFields[key] = translateField(fields[key]);
    });

    return translatedFields as T;
}

/**
 * Translates form validation errors
 *
 * @param errors Object containing validation errors
 * @returns Translated validation errors
 */
export function useTranslatedErrors<T extends Record<string, string>>(errors: T): T {
    const { t } = useTranslation(['validation']);

    const translatedErrors: Record<string, string> = {};

    Object.keys(errors).forEach((key) => {
        translatedErrors[key] = t(`validation:${errors[key]}`, errors[key]);
    });

    return translatedErrors as T;
}

/**
 * Translates form submit button text
 *
 * @param text Submit button text
 * @returns Translated submit button text
 */
export function useTranslatedSubmitText(text: string): string {
    const { t } = useTranslation(['common']);
    return t(`common:${text}`, text);
}
