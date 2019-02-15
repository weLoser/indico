# This file is part of Indico.
# Copyright (C) 2002 - 2018 European Organization for Nuclear Research (CERN).
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

from datetime import datetime

from wtforms import Form
from wtforms.ext.sqlalchemy.fields import QuerySelectField
from wtforms.fields.core import BooleanField, FieldList, FloatField, FormField, IntegerField, RadioField, StringField
from wtforms.fields.simple import FileField, TextAreaField
from wtforms.validators import DataRequired, NumberRange, Optional, ValidationError
from wtforms_components import TimeField

from indico.modules.rb.models.equipment import EquipmentType
from indico.modules.rb.models.locations import Location
from indico.util.i18n import _
from indico.web.forms.base import IndicoForm
from indico.web.forms.fields import IndicoDateField, IndicoQuerySelectMultipleCheckboxField, PrincipalField
from indico.web.forms.validators import UsedIf
from indico.web.forms.widgets import ConcatWidget


class SearchRoomsForm(IndicoForm):
    location = QuerySelectField(_(u'Location'), get_label=lambda x: x.name, query_factory=Location.find,
                                allow_blank=True)
    details = StringField()
    capacity = IntegerField(_(u'Capacity'), validators=[Optional(), NumberRange(min=0)])
    available_equipment = IndicoQuerySelectMultipleCheckboxField(_(u'Equipment'), get_label=u'name',
                                                                 query_factory=lambda: EquipmentType.find().order_by(
                                                                     EquipmentType.name))
    is_only_public = BooleanField(_(u'Only public rooms'), default=True)
    is_auto_confirm = BooleanField(_(u'Only rooms not requiring confirmation'), default=True)
    is_only_active = BooleanField(_(u'Only active rooms'), default=True)
    is_only_my_rooms = BooleanField(_(u'Only my rooms'))
    repeatability = StringField()  # TODO: use repeat_frequency/interval with new UI
    include_pending_blockings = BooleanField(_(u'Check conflicts against pending blockings'), default=True)
    include_pre_bookings = BooleanField(_(u'Check conflicts against pre-bookings'), default=True)


class _TimePair(Form):
    start = TimeField(_(u'from'), [UsedIf(lambda form, field: form.end.data)])
    end = TimeField(_(u'to'), [UsedIf(lambda form, field: form.start.data)])

    def validate_start(self, field):
        if self.start.data and self.end.data and self.start.data >= self.end.data:
            raise ValidationError('The start time must be earlier than the end time.')

    validate_end = validate_start


class _DateTimePair(IndicoForm):
    class Meta:
        csrf = False

    start_date = IndicoDateField(_(u'from'), [UsedIf(lambda form, field: form.end_date.data)])
    start_time = TimeField(None, [Optional()])
    end_date = IndicoDateField(_(u'to'), [UsedIf(lambda form, field: form.start_date.data)])
    end_time = TimeField(None, [Optional()])

    @property
    def start_dt(self):
        if self.start_date.data:
            return datetime.combine(self.start_date.data, self.start_time.data)
        else:
            return None

    @property
    def end_dt(self):
        if self.end_date.data:
            return datetime.combine(self.end_date.data, self.end_time.data)
        else:
            return None

    def validate_start(self, field):
        if self.start_dt and self.end_dt and self.start_dt >= self.end_dt:
            raise ValidationError('The start date must be earlier than the end date.')

    validate_end = validate_start


class RoomForm(IndicoForm):
    name = StringField(_(u'Name'))
    site = StringField(_(u'Site'))
    building = StringField(_(u'Building'), [DataRequired()])
    floor = StringField(_(u'Floor'), [DataRequired()])
    number = StringField(_(u'Number'), [DataRequired()])
    longitude = FloatField(_(u'Longitude'), [Optional()])
    latitude = FloatField(_(u'Latitude'), [Optional()])
    is_active = BooleanField(_(u'Active'), default=True)
    is_reservable = BooleanField(_(u'Public'), default=True)
    reservations_need_confirmation = BooleanField(_(u'Confirmations'))
    notification_for_assistance = BooleanField(_(u'Assistance'))
    notification_before_days = IntegerField(_(u'Send booking reminders X days before (single/daily)'),
                                            [Optional(), NumberRange(min=1, max=30)])
    notification_before_days_weekly = IntegerField(_(u'Send booking reminders X days before (weekly)'),
                                                   [Optional(), NumberRange(min=1, max=30)])
    notification_before_days_monthly = IntegerField(_(u'Send booking reminders X days before (monthly)'),
                                                    [Optional(), NumberRange(min=1, max=30)])
    notifications_enabled = BooleanField(_(u'Reminders enabled'), default=True)
    booking_limit_days = IntegerField(_(u'Maximum length of booking (days)'), [Optional(), NumberRange(min=1)])
    owner = PrincipalField(_(u'Owner'), [DataRequired()], allow_external=True)
    key_location = StringField(_(u'Where is key?'))
    telephone = StringField(_(u'Telephone'))
    capacity = IntegerField(_(u'Capacity'), [Optional(), NumberRange(min=1)], default=20)
    division = StringField(_(u'Department'))
    surface_area = IntegerField(_(u'Surface area'), [Optional(), NumberRange(min=0)])
    max_advance_days = IntegerField(_(u'Maximum advance time for bookings'), [Optional(), NumberRange(min=1)])
    comments = TextAreaField(_(u'Comments'))
    delete_photos = BooleanField(_(u'Delete photos'))
    large_photo = FileField(_(u'Large photo'))
    available_equipment = IndicoQuerySelectMultipleCheckboxField(_(u'Equipment'), get_label=u'name')
    # attribute_* - set at runtime
    bookable_hours = FieldList(FormField(_TimePair), min_entries=1)
    nonbookable_periods = FieldList(FormField(_DateTimePair), min_entries=1)
