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

import 'react-dates/initialize';
import React from 'react';
import PropTypes from 'prop-types';
import {DayPickerSingleDateController as DayPicker} from 'react-dates';

import 'react-dates/lib/css/_datepicker.css';
import './style/dates.scss';


export default class CalendarSingleDatePicker extends React.Component {
    static propTypes = {
        disabledDate: PropTypes.func
    };

    static defaultProps = {
        disabledDate: () => false
    };

    state = {
        focused: true
    };

    onFocusChange = ({focused}) => {
        this.setState({focused});
    };

    render() {
        const {focused} = this.state;
        const {disabledDate, ...props} = this.props;
        return (
            <DayPicker focused={focused}
                       onFocusChange={this.onFocusChange}
                       isOutsideRange={disabledDate}
                       hideKeyboardShortcutsPanel
                       {...props} />
        );
    }
}
