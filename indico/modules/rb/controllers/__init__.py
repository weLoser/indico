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

from __future__ import unicode_literals

from flask import session
from werkzeug.exceptions import Forbidden, NotFound

from indico.core.config import config
from indico.modules.rb.util import rb_check_user_access
from indico.util.i18n import _
from indico.web.rh import RHProtected


class RHRoomBookingProtected(RHProtected):
    def _check_access(self):
        if not config.ENABLE_ROOMBOOKING:
            raise NotFound(_('The room booking module is not enabled.'))
        RHProtected._check_access(self)
        if not rb_check_user_access(session.user):
            raise Forbidden(_('You are not authorized to access the room booking system.'))


class RHRoomBookingBase(RHRoomBookingProtected):
    """Base class for room booking RHs"""

    # legacy code might still show unsanitized content from the DB
    # so we need to keep the sanitizer running until everything in
    # roombooking has been moved to Jinja templates
    CHECK_HTML = True
