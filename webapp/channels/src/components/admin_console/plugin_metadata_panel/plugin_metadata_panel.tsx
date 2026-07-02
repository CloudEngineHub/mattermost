// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';

import ExternalLink from 'components/external_link';

import './plugin_metadata_panel.scss';

const messages = defineMessages({
    website: {
        id: 'admin.plugin.metadata.website',
        defaultMessage: 'website',
    },
    releaseNotes: {
        id: 'admin.plugin.metadata.releaseNotes',
        defaultMessage: 'release notes',
    },
});

export type PluginMetadataPanelProps = {
    name: string;
    id: string;
    version: string;
    homepageUrl?: string;
    releaseNotesUrl?: string;
    className?: string;
};

const PluginMetadataPanel = ({
    name,
    id,
    version,
    homepageUrl,
    releaseNotesUrl,
    className,
}: PluginMetadataPanelProps) => {
    return (
        <span
            className={classNames('PluginMetadataPanel', className)}
            data-testid='plugin-metadata-panel'
        >
            <strong>{name}</strong>
            {' ('}
            <span data-testid='plugin-metadata-id'>{id}</span>
            {' - '}
            <span data-testid='plugin-metadata-version'>{version}</span>
            {homepageUrl && (
                <>
                    {' - '}
                    <ExternalLink
                        href={homepageUrl}
                        location='plugin_metadata_panel'
                    >
                        <FormattedMessage {...messages.website}/>
                    </ExternalLink>
                </>
            )}
            {releaseNotesUrl && (
                <>
                    {' - '}
                    <ExternalLink
                        href={releaseNotesUrl}
                        location='plugin_metadata_panel'
                    >
                        <FormattedMessage {...messages.releaseNotes}/>
                    </ExternalLink>
                </>
            )}
            {')'}
        </span>
    );
};

export default PluginMetadataPanel;
