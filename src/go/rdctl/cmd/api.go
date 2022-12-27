/*
Copyright © 2022 SUSE LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

		http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"regexp"

	"github.com/spf13/cobra"
)

var apiSettings struct {
	Method    string
	InputFile string
	Body      string
}

// apiCmd represents the api command
var apiCmd = &cobra.Command{
	Use:   "api",
	Short: "Run API endpoints directly",
	Long: `Runs API endpoints directly.
Default method is PUT if a body or input file is specified, GET otherwise.

Two ways of specifying a body:
1. --input FILE: For example, '--input .../rancher-desktop/settings.json'. Specify '-' for standard input.

2. --body|-b string: For the 'PUT /settings' endpoint, this must be a valid JSON string.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		return doAPICommand(cmd, args)
	},
}

func init() {
	rootCmd.AddCommand(apiCmd)
	apiCmd.Flags().StringVarP(&apiSettings.Method, "method", "X", "", "Method to use")
	apiCmd.Flags().StringVarP(&apiSettings.InputFile, "input", "", "", "File containing JSON payload to upload (- for standard input)")
	apiCmd.Flags().StringVarP(&apiSettings.Body, "body", "b", "", "JSON payload to upload")
}

func doAPICommand(cmd *cobra.Command, args []string) error {
	var result []byte
	var contents []byte
	var err error
	var errorPacket *APIError

	if len(args) == 0 || len(args[0]) == 0 {
		return fmt.Errorf("api command: no endpoint specified")
	}
	if len(args) > 1 {
		return fmt.Errorf("api command: too many endpoints specified (%v); exactly one must be specified", args)
	}
	endpoint := args[0]
	if endpoint != "/" && regexp.MustCompile(`^/v\d+(?:/|$)`).FindString(endpoint) == "" {
		endpoint = fmt.Sprintf("/%s", versionCommand(apiVersion, endpoint))
	}
	if apiSettings.InputFile != "" && apiSettings.Body != "" {
		return fmt.Errorf("api command: --body and --input options cannot both be specified")
	}
	// No longer emit usage info on errors
	cmd.SilenceUsage = true
	if apiSettings.InputFile != "" {
		if apiSettings.Method == "" {
			apiSettings.Method = "PUT"
		}
		if apiSettings.InputFile == "-" {
			contents, err = ioutil.ReadAll(os.Stdin)
		} else {
			contents, err = ioutil.ReadFile(apiSettings.InputFile)
		}
		if err != nil {
			return err
		}
		result, errorPacket, err = processRequestForAPI(doRequestWithPayload(apiSettings.Method, endpoint, bytes.NewBuffer(contents)))
	} else if apiSettings.Body != "" {
		if apiSettings.Method == "" {
			apiSettings.Method = "PUT"
		}
		result, errorPacket, err = processRequestForAPI(doRequestWithPayload(apiSettings.Method, endpoint, bytes.NewBufferString(apiSettings.Body)))
	} else {
		if apiSettings.Method == "" {
			apiSettings.Method = "GET"
		}
		result, errorPacket, err = processRequestForAPI(doRequest(apiSettings.Method, endpoint))
	}
	if err != nil {
		return err
	}
	// If we got an error packet from the server:
	//   write the packet to stdout
	//   write the result body, if there is one to stderr
	//   exit status 1 (do not have cobra deal with the error, because it writes it to stderr
	// Otherwise:
	//   Write the result body to stdout
	//   Return nil error (=> exit status 0)
	if len(result) > 0 {
		if errorPacket == nil {
			fmt.Fprintln(os.Stdout, string(result))
		} else {
			fmt.Fprintln(os.Stderr, string(result))
		}
	}
	if errorPacket == nil {
		return nil
	}
	errorPacketBytes, err := json.Marshal(*errorPacket)
	if err != nil {
		return fmt.Errorf("error converting error message info: %w", err)
	}
	fmt.Fprintln(os.Stdout, string(errorPacketBytes))
	os.Exit(1)
	panic("Should never be reached")
}
