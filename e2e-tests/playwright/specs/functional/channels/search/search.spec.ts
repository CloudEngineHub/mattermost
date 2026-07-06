// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test} from '@mattermost/playwright-lib';

import {createPost, expectNoSearchResult, expectSearchResult, submitSearch} from '../migration_helpers';

/**
 * @objective Verify message search displays matching results in the right-hand side.
 * @rfqa_no 8
 * @rfqa_id MM-T350
 * @rfqa_title Searching displays results in RHS
 */
test('MM-T350 Searching displays results in the RHS', async ({pw}) => {
    const {adminClient, team, user} = await pw.initSetup();
    const channel = await adminClient.getChannelByName(team.id, 'off-topic');
    const message = `Basic word search: Hello world! #hello ${pw.random.id()}`;

    // # Create and search for a message with markdown-like content
    await createPost(adminClient, user, channel, message);
    const {channelsPage} = await pw.testBrowser.login(user);
    await channelsPage.goto(team.name, channel.name);
    await channelsPage.toBeVisible();
    const query = `hello ${message.split(' ').pop()}`;
    await submitSearch(channelsPage, query);

    // * Verify the matching result appears in the RHS
    await expectSearchResult(channelsPage, 'Hello world', query);
    await expectSearchResult(channelsPage, '#hello', query);
});

/**
 * @objective Verify changing timezone changes which posts match an on: date filter.
 * @rfqa_no 9
 * @rfqa_id MM-T595
 * @rfqa_title Changing timezone changes day search results appears
 */
test('MM-T595 Changing timezone changes day search results appears', async ({pw}) => {
    const {adminClient, team, user} = await pw.initSetup();
    const channel = await adminClient.getChannelByName(team.id, 'off-topic');
    const identifier = `timezone-${pw.random.id()}`;
    const targetMessage = `targetAM ${identifier}`;
    const targetTimestamp = Date.UTC(2018, 9, 31, 23, 59);

    // # Create a post close to a day boundary and search in UTC
    await adminClient.patchUser({
        id: user.id,
        timezone: {automaticTimezone: '', manualTimezone: 'UTC', useAutomaticTimezone: 'false'},
    });
    await createPost(adminClient, user, channel, targetMessage, '', targetTimestamp);
    const {channelsPage} = await pw.testBrowser.login(user);
    await channelsPage.goto(team.name, channel.name);
    await channelsPage.toBeVisible();
    const utcQuery = `on:2018-10-31 ${identifier}`;
    await submitSearch(channelsPage, utcQuery);

    // * Verify the result appears for the UTC date
    await expectSearchResult(channelsPage, targetMessage, utcQuery);

    // # Change timezone and run the same date-filtered search
    await adminClient.patchUser({
        id: user.id,
        timezone: {automaticTimezone: '', manualTimezone: 'Europe/Brussels', useAutomaticTimezone: 'false'},
    });
    await channelsPage.page.reload();
    await submitSearch(channelsPage, utcQuery);

    // * Verify the post no longer matches the previous day in the new timezone
    await expectNoSearchResult(channelsPage, targetMessage);
});

/**
 * @objective Verify editing a date-filtered search query updates the search results.
 * @rfqa_no 10
 * @rfqa_id MM-T599
 * @rfqa_title Edit date and search again
 */
test('MM-T599 Edit date and search again', async ({pw}) => {
    const {adminClient, team, user} = await pw.initSetup();
    const channel = await adminClient.getChannelByName(team.id, 'off-topic');
    const targetMessage = `calendarUpdate-${pw.random.id()}`;
    const targetTimestamp = Date.UTC(2019, 0, 15, 9, 30);

    // # Create a dated post and search for its date
    await createPost(adminClient, user, channel, targetMessage, '', targetTimestamp);
    const {channelsPage} = await pw.testBrowser.login(user);
    await channelsPage.goto(team.name, channel.name);
    await channelsPage.toBeVisible();
    const originalDateQuery = `on:2019-01-15 ${targetMessage}`;
    await submitSearch(channelsPage, originalDateQuery);

    // * Verify the matching post appears for the original date
    await expectSearchResult(channelsPage, targetMessage, originalDateQuery);

    // # Edit the date and run the search again
    await submitSearch(channelsPage, `on:2019-01-16 ${targetMessage}`);

    // * Verify the original post is not returned for the edited date
    await expectNoSearchResult(channelsPage, targetMessage);
});
