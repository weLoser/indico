/* This file is part of Indico.
 * Copyright (C) 2002 - 2018 European Organization for Nuclear Research (CERN).
 *
 * Indico is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * Indico is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Indico; if not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import createReduxStore from 'indico/utils/redux';
import {addError} from './actions';
import reducer from './reducers';
import ErrorDialog from './container';


let store;
export default function showReactErrorDialog(error) {
    if (!store) {
        store = createReduxStore('errors', {
            errors: reducer,
        });
        const container = document.createElement('div');
        document.body.appendChild(container);
        const jsx = (
            <Provider store={store}>
                <ErrorDialog initialValues={{email: Indico.User.email}} />
            </Provider>
        );
        ReactDOM.render(jsx, container);
    }
    store.dispatch(addError(error));
}
