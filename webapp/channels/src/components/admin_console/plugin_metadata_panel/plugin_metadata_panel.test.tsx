// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import PluginMetadataPanel from 'components/admin_console/plugin_metadata_panel/plugin_metadata_panel';

import {screen, renderWithContext} from 'tests/react_testing_utils';

describe('PluginMetadataPanel', () => {
    test('should render plugin name, id, and version on one line', () => {
        renderWithContext(
            <PluginMetadataPanel
                name='FL3XX'
                id='com.mattermost.fl3xx'
                version='0.7.4'
            />,
        );

        expect(screen.getByTestId('plugin-metadata-panel')).toHaveTextContent('FL3XX (com.mattermost.fl3xx - 0.7.4)');
        expect(screen.getByTestId('plugin-metadata-id')).toHaveTextContent('com.mattermost.fl3xx');
        expect(screen.getByTestId('plugin-metadata-version')).toHaveTextContent('0.7.4');
    });

    test('should render website and release notes links when provided', () => {
        renderWithContext(
            <PluginMetadataPanel
                name='Agents Plugin'
                id='com.mattermost.ai'
                version='1.2.3'
                homepageUrl='https://github.com/mattermost/mattermost-plugin-ai'
                releaseNotesUrl='https://github.com/mattermost/mattermost-plugin-ai/releases/tag/v1.2.3'
            />,
        );

        expect(screen.getByText('website')).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-plugin-ai');
        expect(screen.getByText('release notes')).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-plugin-ai/releases/tag/v1.2.3');
    });

    test('should not render links when urls are not provided', () => {
        renderWithContext(
            <PluginMetadataPanel
                name='Agents Plugin'
                id='com.mattermost.ai'
                version='1.2.3'
            />,
        );

        expect(screen.queryByText('website')).not.toBeInTheDocument();
        expect(screen.queryByText('release notes')).not.toBeInTheDocument();
    });
});
