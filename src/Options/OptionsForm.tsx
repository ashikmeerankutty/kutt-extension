import React, { useEffect } from 'react';
import { withFormik, Field, Form, FormikBag, FormikProps, FormikErrors } from 'formik';

import Icon from '../components/Icon';
import AutoSave from '../util/autoSave';
import messageUtil from '../util/mesageUtil';
import { CHECK_API_KEY } from '../Background/constants';
import { TextField, CheckBox } from '../components/Input';
import { updateExtensionSettings } from '../util/settings';
import { SuccessfulApiKeyCheckProperties, ApiErroredProperties } from '../Background';

export type OptionsFormValuesProperties = {
    apikey: string;
    autocopy: boolean;
    history: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onSave = (values: OptionsFormValuesProperties): Promise<any> => {
    // should always return a Promise
    return updateExtensionSettings(values); // update local settings
};

// Note: The default key-value pairs are not saved to storage without any first interaction
const InnerForm: React.FC<FormikProps<OptionsFormValuesProperties>> = props => {
    const { isSubmitting, handleSubmit, setStatus, status } = props;
    // ToDo: add custom domain form input

    // run on component mount
    useEffect(() => {
        setStatus({ error: null, message: '' });
    }, [setStatus]);

    return (
        <Form onSubmit={handleSubmit} autoComplete="off" id="options__form">
            <div>
                <Field name="apikey" type="password" component={TextField} label="API Key" />
                <button type="submit" disabled={isSubmitting}>
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {isSubmitting ? (
                        <Icon name="spinner" />
                    ) : status && status.error !== null ? (
                        (status && !status.error && <Icon name="tick" />) || <Icon name="cross" />
                    ) : (
                        'Validate'
                    )}
                </button>
            </div>
            <div>
                <Field name="autocopy" component={CheckBox} label="Auto Copy URL to Clipboard" />
            </div>
            <div>
                <Field name="history" component={CheckBox} label="Keep URLs History" />
            </div>

            {/* auto save hook component */}
            <AutoSave
                onSave={onSave}
                render={({ isSaving }: { isSaving: boolean }): JSX.Element | null => {
                    return isSaving ? <Icon name="spinner" /> : null;
                }}
            />
        </Form>
    );
};

// The type of props `OptionsForm` receives
type OptionsFormProperties = {
    defaultValues: OptionsFormValuesProperties;
};

// Wrap our form with the withFormik HoC
const OptionsForm = withFormik<OptionsFormProperties, OptionsFormValuesProperties>({
    // Transform outer props into form values
    mapPropsToValues: ({ defaultValues: { apikey, autocopy, history } }): OptionsFormValuesProperties => {
        return {
            apikey,
            autocopy,
            history,
        };
    },

    validate: (values: OptionsFormValuesProperties): FormikErrors<OptionsFormValuesProperties> => {
        const errors: FormikErrors<OptionsFormValuesProperties> = {};

        if (!values.apikey) {
            errors.apikey = 'API key missing';
        }
        // ToDo: restore before on production
        // else if (values.apikey && values.apikey.trim().length < 40) {
        //     errors.apikey = 'API key must be 40 characters';
        // } else if (values.apikey && values.apikey.trim().length > 40) {
        //     errors.apikey = 'API key cannot exceed 40 characters';
        // }

        return errors;
    },

    // for API Key validation only
    handleSubmit: async (
        values: OptionsFormValuesProperties,
        { setSubmitting, setStatus }: FormikBag<OptionsFormProperties, OptionsFormValuesProperties>
    ) => {
        // request API validation request
        const response: SuccessfulApiKeyCheckProperties | ApiErroredProperties = await messageUtil.send(CHECK_API_KEY, {
            apikey: values.apikey.trim(),
        });

        if (!response.error) {
            // set top-level status
            setStatus({ error: false, message: 'Valid API Key' });

            // Store user account information
            const { domains, email } = response.data;
            await updateExtensionSettings({ user: { domains, email } });
        } else {
            // ---- errored ---- //
            setStatus({ error: true, message: response.message });

            // Delete `user` field from settings
            await updateExtensionSettings({ user: null });
        }

        setTimeout(() => {
            // Reset status
            setStatus({ error: null, message: '' });

            // enable validate button
            setSubmitting(false);
        }, 1000);
    },

    displayName: 'OptionsForm',
})(InnerForm);

export default OptionsForm;
