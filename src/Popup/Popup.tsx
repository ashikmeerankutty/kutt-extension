import React, { useEffect, useState } from 'react';

import { UserSettingsResponseProperties } from '../Background';
import { getExtensionSettings } from '../util/settings';
import BodyWrapper from '../components/BodyWrapper';
import Loader from '../components/Loader';
import PopupForm from './PopupForm';
import PopupHeader from './Header';
import PopupBody, { ProcessedRequestProperties } from './PopupBody';

import './styles.scss';
import { openExtOptionsPage } from '../util/tabs';

type DomainOptionsProperties = {
    option: string;
    value: string;
    id: string;
    disabled: boolean;
};

export type ProcessRequestProperties = React.Dispatch<
    React.SetStateAction<{
        error: boolean | null;
        message: string;
    }>
>;

export type UserConfigProperties = {
    apikey: string;
    domainOptions: DomainOptionsProperties[];
};

export type SetPageReloadFlagProperties = React.Dispatch<React.SetStateAction<boolean>>;

const Popup: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [pageReloadFlag, setPageReloadFlag] = useState<boolean>(false);
    const [userConfig, setUserConfig] = useState<UserConfigProperties>({
        apikey: '',
        domainOptions: [],
    });
    const [requestProcessed, setRequestProcessed] = useState<ProcessedRequestProperties>({ error: null, message: '' });

    // This will be re-rendered on `pageReloadFlag` change
    useEffect((): void => {
        async function getUserSettings(): Promise<void> {
            // ToDo: type
            const { settings = {} } = await getExtensionSettings();
            // ToDo: change kutt.it entry to custom host(if exist)
            const defaultOptions: DomainOptionsProperties[] = [
                {
                    id: '',
                    option: '-- Choose Domain --',
                    value: '',
                    disabled: true,
                },
                {
                    id: 'default',
                    option: 'kutt.it',
                    value: 'https://kutt.it',
                    disabled: false,
                },
            ];

            // No API Key set
            if (!Object.prototype.hasOwnProperty.call(settings, 'apikey') || settings.apikey === '') {
                setRequestProcessed({ error: true, message: 'Extension requires an API Key to work' });
                setLoading(false);

                // Open options page
                setTimeout(() => {
                    return openExtOptionsPage();
                }, 1300);

                return;
            }

            // `user` & `apikey` fields exist on storage
            if (Object.prototype.hasOwnProperty.call(settings, 'user') && settings.user) {
                const { user }: { user: UserSettingsResponseProperties } = settings;

                let optionsArray: DomainOptionsProperties[] = user.domains.map(({ id, address, homepage, banned }) => {
                    return {
                        id,
                        option: homepage,
                        value: address,
                        disabled: banned,
                    };
                });

                // merge to beginning of array
                optionsArray = defaultOptions.concat(optionsArray);

                // update domain list
                setUserConfig({ apikey: settings.apikey, domainOptions: optionsArray });
            } else {
                // no `user` but `apikey` exist on storage
                setUserConfig({ apikey: settings.apikey, domainOptions: defaultOptions });
            }

            // ToDo: handle init operations(if any)
            setLoading(false);
        }

        getUserSettings();
    }, [pageReloadFlag]);

    return (
        <BodyWrapper>
            <div id="popup">
                {!loading ? (
                    <>
                        <PopupHeader
                            userConfig={userConfig}
                            pageReloadFlag={pageReloadFlag}
                            setPageReloadFlag={setPageReloadFlag}
                        />

                        {requestProcessed.error !== null && <PopupBody requestProcessed={requestProcessed} />}

                        <PopupForm
                            defaultDomainId="default"
                            userConfig={userConfig}
                            setLoading={setLoading}
                            setRequestProcessed={setRequestProcessed}
                        />
                    </>
                ) : (
                    <Loader />
                )}
            </div>
        </BodyWrapper>
    );
};

export default Popup;
