/*
 * Copyright (C) 2014 Glyptodon LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * A service for authenticating a user against the REST API.
 */
angular.module('auth').factory('authenticationService', ['$http', '$cookieStore',
        function authenticationService($http, $cookieStore) {

    var service = {};

    /**
     * The unique identifier of the local cookie which stores the user's
     * current authentication token and user ID.
     *
     * @type String
     */
    var AUTH_COOKIE_ID = "GUAC_AUTH";

    /**
     * Makes a request to authenticate a user using the token REST API endpoint, 
     * returning a promise that succeeds only if the login operation was
     * successful. The resulting authentication data can be retrieved later
     * via getCurrentToken() or getCurrentUserID().
     * 
     * @param {String} username
     *     The username to log in with.
     *
     * @param {String} password
     *     The password to log in with.
     *
     * @returns {Promise}
     *     A promise which succeeds only if the login operation was successful.
     */
    service.login = function login(username, password) {
        return $http({
            method: 'POST',
            url: 'api/tokens',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: $.param({
                username: username,
                password: password
            })
        }).success(function success(data, status, headers, config) {
            $cookieStore.put(AUTH_COOKIE_ID, {
                authToken : data.authToken,
                userID    : data.userID
            });
        });
    };

    /**
     * Makes a request to logout a user using the login REST API endpoint, 
     * returning a promise succeeds only if the logout operation was
     * successful.
     * 
     * @returns {Promise}
     *     A promise which succeeds only if the logout operation was
     *     successful.
     */
    service.logout = function logout() {
        return $http({
            method: 'DELETE',
            url: 'api/tokens/' + encodeURIComponent(service.getCurrentToken())
        });
    };

    /**
     * Returns the user ID of the current user. If the current user is not
     * logged in, this ID may not be valid.
     *
     * @returns {String}
     *     The user ID of the current user, or null if no authentication data
     *     is present.
     */
    service.getCurrentUserID = function getCurrentUserID() {

        // Return user ID, if available
        var authData = $cookieStore.get(AUTH_COOKIE_ID);
        if (authData)
            return authData.userID;

        // No auth data present
        return null;

    };

    /**
     * Returns the auth token associated with the current user. If the current
     * user is not logged in, this token may not be valid.
     *
     * @returns {String}
     *     The auth token associated with the current user, or null if no
     *     authentication data is present.
     */
    service.getCurrentToken = function getCurrentToken() {

        // Return auth token, if available
        var authData = $cookieStore.get(AUTH_COOKIE_ID);
        if (authData)
            return authData.authToken;

        // No auth data present
        return null;

    };
    
    return service;
}]);
