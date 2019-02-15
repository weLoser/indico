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

import {indicoAxios, handleAxiosError} from 'indico/utils/axios';


export const SET_KEYWORD = 'SET_KEYWORD';
export const SET_FILTER = 'SET_FILTER';
export const SET_PAGE = 'SET_PAGE';
export const UPDATE_ENTRIES = 'UPDATE_ENTRIES';
export const FETCH_STARTED = 'FETCH_STARTED';
export const FETCH_FAILED = 'FETCH_FAILED';
export const SET_DETAILED_VIEW = 'SET_DETAILED_VIEW';
export const VIEW_PREV_ENTRY = 'VIEW_PREV_ENTRY';
export const VIEW_NEXT_ENTRY = 'VIEW_NEXT_ENTRY';


export function setKeyword(keyword) {
    return {type: SET_KEYWORD, keyword};
}

export function setFilter(filter) {
    return {type: SET_FILTER, filter};
}

export function setPage(currentPage) {
    return {type: SET_PAGE, currentPage};
}

export function setDetailedView(entryIndex) {
    return {type: SET_DETAILED_VIEW, currentViewIndex: entryIndex};
}

export function viewPrevEntry() {
    return async (dispatch, getStore) => {
        const {
            staticData: {pageSize},
            logs: {currentViewIndex, currentPage}
        } = getStore();

        if (currentViewIndex === 0) {
            if (currentPage === 0) {
                // ERROR!
            } else {
                await dispatch(setPage(currentPage - 1));
                await dispatch(fetchLogEntries());
                await dispatch(setDetailedView(pageSize - 1));
            }
        } else {
            dispatch({type: SET_DETAILED_VIEW, currentViewIndex: currentViewIndex - 1});
        }
    };
}

export function viewNextEntry() {
    return async (dispatch, getStore) => {
        const {
            staticData: {pageSize},
            logs: {currentViewIndex, currentPage, pages}
        } = getStore();

        if (currentViewIndex === (pageSize - 1)) {
            if (currentPage === pages[pages.length - 1]) {
                // ERROR!
            } else {
                await dispatch(setPage(currentPage + 1));
                await dispatch(setDetailedView(0));
                await dispatch(fetchLogEntries());
            }
        } else {
            dispatch({type: SET_DETAILED_VIEW, currentViewIndex: currentViewIndex + 1});
        }
    };
}

export function updateEntries(entries, pages, totalPageCount) {
    return {type: UPDATE_ENTRIES, entries, pages, totalPageCount};
}

export function fetchStarted() {
    return {type: FETCH_STARTED};
}

export function fetchFailed() {
    return {type: FETCH_FAILED};
}

export function fetchLogEntries() {
    return async (dispatch, getStore) => {
        dispatch(fetchStarted());

        const {
            logs: {filters, keyword, currentPage},
            staticData: {fetchLogsUrl},
        } = getStore();

        const params = {
            page: currentPage,
            filters: [],
        };
        if (keyword) {
            params.q = keyword;
        }

        Object.entries(filters).forEach(([item, active]) => {
            if (active) {
                params.filters.push(item);
            }
        });

        let response;
        try {
            response = await indicoAxios.get(fetchLogsUrl, {params});
        } catch (error) {
            handleAxiosError(error);
            dispatch(fetchFailed());
            return;
        }
        const {entries, pages, total_page_count: totalPageCount} = response.data;
        dispatch(updateEntries(entries, pages, totalPageCount));
    };
}
