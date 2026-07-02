// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package plugin

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin/utils"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
)

// TestShutdownMarksPluginNotRunningAfterOnDeactivate verifies that Shutdown keeps a plugin
// reporting as active for the duration of its own OnDeactivate call, so IsActive-gated dispatch
// (RunMultiPluginHook*) still admits hooks the plugin dispatches back to itself from within
// OnDeactivate (e.g. via a CreatePost call), then marks it not running once OnDeactivate
// completes, before its RPC connection is torn down, rather than only after every plugin in the
// environment has finished tearing down.
func TestShutdownMarksPluginNotRunningAfterOnDeactivate(t *testing.T) {
	pluginDir, err := os.MkdirTemp("", "mm-shutdown-state-plugin")
	require.NoError(t, err)
	t.Cleanup(func() { os.RemoveAll(pluginDir) })
	webappPluginDir, err := os.MkdirTemp("", "mm-shutdown-state-webapp")
	require.NoError(t, err)
	t.Cleanup(func() { os.RemoveAll(webappPluginDir) })

	pluginID := "test-shutdown-state-plugin"
	require.NoError(t, os.MkdirAll(filepath.Join(pluginDir, pluginID), 0700))
	backend := filepath.Join(pluginDir, pluginID, "backend.exe")

	// OnDeactivate sleeps well past when we expect IsActive to already report false.
	utils.CompileGo(t, `
		package main

		import (
			"time"

			"github.com/mattermost/mattermost/server/public/plugin"
		)

		type MyPlugin struct {
			plugin.MattermostPlugin
		}

		func (p *MyPlugin) OnDeactivate() error {
			time.Sleep(500 * time.Millisecond)
			return nil
		}

		func main() {
			plugin.ClientMain(&MyPlugin{})
		}
	`, backend)

	require.NoError(t, os.WriteFile(
		filepath.Join(pluginDir, pluginID, "plugin.json"),
		[]byte(`{"id":"`+pluginID+`","server":{"executable":"backend.exe"}}`),
		0600,
	))

	logger := mlog.CreateConsoleTestLogger(t)
	apiImpl := func(*model.Manifest) API { return nil }
	env, err := NewEnvironment(apiImpl, nil, pluginDir, webappPluginDir, logger, nil)
	require.NoError(t, err)

	_, _, err = env.Activate(pluginID)
	require.NoError(t, err)
	require.True(t, env.IsActive(pluginID))

	shutdownDone := make(chan struct{})
	go func() {
		defer close(shutdownDone)
		env.Shutdown()
	}()

	// While OnDeactivate is still running (well within its 500ms sleep), IsActive must still
	// report true so a plugin dispatching hooks back to itself from OnDeactivate isn't rejected.
	time.Sleep(200 * time.Millisecond)
	require.True(t, env.IsActive(pluginID), "IsActive should remain true while OnDeactivate is still running")

	select {
	case <-shutdownDone:
	case <-time.After(2 * time.Second):
		t.Fatal("Shutdown did not return")
	}

	require.False(t, env.IsActive(pluginID))
}
