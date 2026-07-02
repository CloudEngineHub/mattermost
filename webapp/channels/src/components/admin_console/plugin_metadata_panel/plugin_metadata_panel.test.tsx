// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import PluginMetadataPanel from 'components/admin_console/plugin_metadata_panel/plugin_metadata_panel';

import {screen, renderWithContext} from 'tests/react_testing_utils';

describe('PluginMetadataPanel', () => {
    test('should render plugin id and version', () => {
        renderWithContext(
            <PluginMetadataPanel
                id='com.mattermost.ai'
                version='1.2.3'
            />,
        );

        expect(screen.getByTestId('plugin-metadata-id')).toHaveTextContent('com.mattermost.ai');
        expect(screen.getByTestId('plugin-metadata-version')).toHaveTextContent('1.2.3');
    });

    test('should render website and release notes links when provided', () => {
        renderWithContext(
            <PluginMetadataPanel
                id='com.mattermost.ai'
                version='1.2.3'
                homepageUrl='https://github.com/mattermost/mattermost-plugin-ai'
                releaseNotesUrl='https://github.com/mattermost/mattermost-plugin-ai/releases/tag/v1.2.3'
            />,
        );

        expect(screen.getByText('Website')).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-plugin-ai');
        expect(screen.getByText('Release notes')).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-plugin-ai/releases/tag/v1.2.3');
    });

    test('should not render links when urls are not provided', () => {
        renderWithContext(
            <PluginMetadataPanel
                id='com.mattermost.ai'
                version='1.2.3'
            />,
        );

        expect(screen.queryByText('Website')).not.toBeInTheDocument();
        expect(screen.queryByText('Release notes')).not.toBeInTheDocument();
    });
});
