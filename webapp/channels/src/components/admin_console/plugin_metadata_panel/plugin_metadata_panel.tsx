// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';

import CopyButton from 'components/copy_button';
import ExternalLink from 'components/external_link';

import './plugin_metadata_panel.scss';

const messages = defineMessages({
    pluginId: {
        id: 'admin.plugin.metadata.pluginId',
        defaultMessage: 'Plugin ID:',
    },
    version: {
        id: 'admin.plugin.metadata.version',
        defaultMessage: 'Version:',
    },
    website: {
        id: 'admin.plugin.metadata.website',
        defaultMessage: 'Website',
    },
    releaseNotes: {
        id: 'admin.plugin.metadata.releaseNotes',
        defaultMessage: 'Release notes',
    },
});

export type PluginMetadataPanelProps = {
    id: string;
    version: string;
    homepageUrl?: string;
    releaseNotesUrl?: string;
    variant?: 'management' | 'settings';
    className?: string;
};

const PluginMetadataPanel = ({
    id,
    version,
    homepageUrl,
    releaseNotesUrl,
    variant = 'management',
    className,
}: PluginMetadataPanelProps) => {
    const hasLinks = Boolean(homepageUrl || releaseNotesUrl);

    return (
        <div
            className={classNames(
                'PluginMetadataPanel',
                `PluginMetadataPanel--${variant}`,
                className,
            )}
            data-testid='plugin-metadata-panel'
        >
            <div className='PluginMetadataPanel__row'>
                <span className='PluginMetadataPanel__label'>
                    <FormattedMessage {...messages.pluginId}/>
                </span>
                <span className='PluginMetadataPanel__value'>
                    <span
                        className='PluginMetadataPanel__id'
                        data-testid='plugin-metadata-id'
                    >
                        {id}
                    </span>
                    <CopyButton
                        content={id}
                        isForText={true}
                    />
                </span>
            </div>
            <div className='PluginMetadataPanel__row'>
                <span className='PluginMetadataPanel__label'>
                    <FormattedMessage {...messages.version}/>
                </span>
                <span
                    className='PluginMetadataPanel__value'
                    data-testid='plugin-metadata-version'
                >
                    {version}
                </span>
            </div>
            {hasLinks && (
                <div className='PluginMetadataPanel__links'>
                    {homepageUrl && (
                        <ExternalLink
                            href={homepageUrl}
                            location='plugin_metadata_panel'
                        >
                            <FormattedMessage {...messages.website}/>
                        </ExternalLink>
                    )}
                    {releaseNotesUrl && (
                        <ExternalLink
                            href={releaseNotesUrl}
                            location='plugin_metadata_panel'
                        >
                            <FormattedMessage {...messages.releaseNotes}/>
                        </ExternalLink>
                    )}
                </div>
            )}
        </div>
    );
};

export default PluginMetadataPanel;
