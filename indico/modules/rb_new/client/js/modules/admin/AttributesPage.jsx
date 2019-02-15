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
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Field} from 'react-final-form';
import {Icon, List, Popup} from 'semantic-ui-react';
import {Param, Plural, PluralTranslate, Singular, Translate} from 'indico/react/i18n';
import {formatters, ReduxCheckboxField, ReduxFormField} from 'indico/react/forms';
import * as adminActions from './actions';
import * as adminSelectors from './selectors';
import EditableList from './EditableList';

import './EditableList.module.scss';


class AttributesPage extends React.PureComponent {
    static propTypes = {
        isFetching: PropTypes.bool.isRequired,
        attributes: PropTypes.array.isRequired,
        actions: PropTypes.exact({
            fetchAttributes: PropTypes.func.isRequired,
            deleteAttribute: PropTypes.func.isRequired,
            updateAttribute: PropTypes.func.isRequired,
            createAttribute: PropTypes.func.isRequired,
        }).isRequired,
    };

    componentDidMount() {
        const {actions: {fetchAttributes}} = this.props;
        fetchAttributes();
    }

    renderItem = ({title, hidden, numRooms}) => (
        <List.Content styleName="info">
            <List.Header>
                <span styleName="name">{title}</span>
                {hidden && (
                    <Popup trigger={<Icon name="hide" color="blue" />}>
                        <Translate>
                            This attribute is not shown in the public room details.
                        </Translate>
                    </Popup>
                )}
            </List.Header>
            <List.Description>
                {!numRooms ? (
                    <Translate>Currently unused</Translate>
                ) : (
                    <PluralTranslate count={numRooms}>
                        <Singular>
                            Used in <Param name="count" wrapper={<strong />}>1</Param> room
                        </Singular>
                        <Plural>
                            Used in
                            {' '}
                            <Param name="count" wrapper={<strong />} value={numRooms} />
                            {' '}
                            rooms
                        </Plural>
                    </PluralTranslate>
                )}
            </List.Description>
        </List.Content>
    );

    renderForm = fprops => (
        <>
            <Field name="name" component={ReduxFormField} as="input"
                   required
                   format={formatters.slugify} formatOnBlur
                   label={Translate.string('Name')}
                   disabled={fprops.submitting}
                   autoFocus />
            <Field name="title" component={ReduxFormField} as="input"
                   required
                   format={formatters.trim} formatOnBlur
                   label={Translate.string('Title')}
                   disabled={fprops.submitting} />
            <Field name="hidden" component={ReduxCheckboxField}
                   format={formatters.trim} formatOnBlur
                   componentLabel={Translate.string('Hidden')}
                   disabled={fprops.submitting} />
        </>
    );

    renderDeleteMessage = ({title, numRooms}) => {
        return (
            <>
                <Translate>
                    Are you sure you want to delete the attribute
                    {' '}
                    <Param name="name" wrapper={<strong />} value={title} />?
                </Translate>
                {numRooms > 0 && (
                    <>
                        <br />
                        <PluralTranslate count={numRooms}>
                            <Singular>
                                It is currently used in <Param name="count" wrapper={<strong />}>1</Param>
                                {' '}
                                room.
                            </Singular>
                            <Plural>
                                It is currently used in
                                {' '}
                                <Param name="count" wrapper={<strong />} value={numRooms} />
                                {' '}
                                rooms.
                            </Plural>
                        </PluralTranslate>
                    </>
                )}
            </>
        );
    };


    render() {
        const {
            isFetching, attributes,
            actions: {createAttribute, updateAttribute, deleteAttribute},
        } = this.props;

        return (
            <EditableList title={Translate.string('Attributes')}
                          addModalTitle={Translate.string('Add attribute')}
                          isFetching={isFetching}
                          items={attributes}
                          renderItem={this.renderItem}
                          renderAddForm={this.renderForm}
                          renderEditForm={this.renderForm}
                          renderDeleteMessage={this.renderDeleteMessage}
                          onCreate={createAttribute}
                          onUpdate={updateAttribute}
                          onDelete={deleteAttribute} />
        );
    }
}

export default connect(
    state => ({
        isFetching: adminSelectors.isFetchingAttributes(state),
        attributes: adminSelectors.getAttributes(state),
    }),
    dispatch => ({
        actions: bindActionCreators({
            fetchAttributes: adminActions.fetchAttributes,
            deleteAttribute: ({id}) => adminActions.deleteAttribute(id),
            updateAttribute: ({id}, data) => adminActions.updateAttribute(id, data),
            createAttribute: adminActions.createAttribute,
        }, dispatch),
    })
)(AttributesPage);
