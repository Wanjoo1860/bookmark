// ============================================================
// Graph API 호출 헬퍼
// ============================================================

async function ensureToken() {
    if (!APP.accessToken) {
        await getToken();
    }
}

async function graphCall(url, method, body) {
    await ensureToken();
    var options = {
        method: method || 'GET',
        headers: {
            'Authorization': 'Bearer ' + APP.accessToken,
            'Content-Type': 'application/json',
            'Prefer': 'HonorNonIndexedQueriesWarningMayFailRandomly'
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    var response = await fetch(url, options);

    if (response.status === 401) {
        await getToken(true);
        options.headers['Authorization'] = 'Bearer ' + APP.accessToken;
        response = await fetch(url, options);
    }

    if (response.status === 204) return null;
    if (!response.ok) {
        var errText = await response.text();
        throw new Error('HTTP ' + response.status + ': ' + errText);
    }
    return await response.json();
}

// ─── 범용 Graph 호출 (auth.js에서 사용) ───
async function graphGet(url) {
    return await graphCall(url, 'GET');
}

async function graphPost(url, body) {
    return await graphCall(url, 'POST', body);
}

async function graphPatch(url, body) {
    return await graphCall(url, 'PATCH', body);
}

async function graphDelete(url) {
    await ensureToken();
    var options = {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + APP.accessToken,
            'Content-Type': 'application/json'
        }
    };
    var response = await fetch(url, options);
    if (response.status === 401) {
        await getToken(true);
        options.headers['Authorization'] = 'Bearer ' + APP.accessToken;
        response = await fetch(url, options);
    }
    if (response.status === 204 || response.status === 200) return null;
    if (!response.ok) {
        var errText = await response.text();
        throw new Error('HTTP ' + response.status + ': ' + errText);
    }
    return null;
}

// ============================================================
// ★★★ 북마크 전용 래퍼 (app.js에서 호출) ★★★
// ============================================================

var BOOKMARKS_BASE = CONFIG.graphUrl + '/sites/' + CONFIG.siteId + '/lists/' + CONFIG.bookmarksListId + '/items';

// 북마크 전체 조회
async function bookmarkGetAll() {
    var url = BOOKMARKS_BASE + '?$expand=fields&$top=999';
    var data = await graphGet(url);
    return (data && data.value) ? data.value : [];
}

// 북마크 추가
async function bookmarkCreate(fields) {
    var url = BOOKMARKS_BASE;
    return await graphPost(url, { fields: fields });
}

// 북마크 수정
async function bookmarkUpdate(itemId, fields) {
    var url = BOOKMARKS_BASE + '/' + itemId + '/fields';
    return await graphPatch(url, fields);
}

// 북마크 삭제
async function bookmarkDeleteItem(itemId) {
    var url = BOOKMARKS_BASE + '/' + itemId;
    return await graphDelete(url);
}
