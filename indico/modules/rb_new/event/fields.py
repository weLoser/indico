# This file is part of Indico.
# Copyright (C) 2002 - 2019 European Organization for Nuclear Research (CERN).
#
# Indico is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation; either version 3 of the
# License, or (at your option) any later version.
#
# Indico is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Indico; if not, see <http://www.gnu.org/licenses/>.

from __future__ import unicode_literals

from wtforms import Field

from indico.util.i18n import _
from indico.web.flask.util import url_for
from indico.web.forms.widgets import SelectizeWidget


class LinkedObjectField(Field):
    widget = SelectizeWidget(allow_by_id=True, search_field='title', label_field='full_title', preload=True,
                             inline_js=True)

    def __init__(self, *args, **kwargs):
        self.ajax_endpoint = kwargs.pop('ajax_endpoint')
        super(LinkedObjectField, self).__init__(*args, **kwargs)

    def _value(self):
        pass

    @property
    def event(self):
        # This cannot be accessed in __init__ since `get_form` is set
        # afterwards (when the field gets bound to its form) so we
        # need to access it through a property instead.
        return self.get_form().event

    @property
    def search_url(self):
        return url_for(self.ajax_endpoint, self.event)


class ContributionField(LinkedObjectField):
    """A selectize-based field to select a contribution that has no reservation yet."""
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('render_kw', {}).setdefault('placeholder', _('Enter contribution title or #id'))
        super(ContributionField, self).__init__(*args, **kwargs)


class SessionBlockField(LinkedObjectField):
    """A selectize-based field to select a session block that has no reservation yet."""
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('render_kw', {}).setdefault('placeholder', _('Enter session block title'))
        super(SessionBlockField, self).__init__(*args, **kwargs)
