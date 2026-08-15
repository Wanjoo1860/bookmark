async function onLoginSuccess() {
    try {
        var me = await graphGet(CONFIG.graphUrl + '/me');
        APP.currentUserId = me.id;
        APP.currentUserEmail = (me.mail || me.userPrincipalName || '').toLowerCase();
        APP.currentUser = {
            id: me.id,
            email: APP.currentUserEmail,
            name: me.displayName || APP.currentUserEmail
        };

        await checkUserRole();
        showAppScreen();

        // ★★★ loadBookmarks 호출 (window에 노출된 함수 사용) ★★★
        if(typeof window.loadBookmarks === 'function'){
            window.loadBookmarks();
        } else {
            // app.js가 아직 로드되지 않은 경우 — 잠시 대기 후 재시도
            setTimeout(function(){
                if(typeof window.loadBookmarks === 'function'){
                    window.loadBookmarks();
                } else {
                    console.error('[Auth] loadBookmarks를 찾을 수 없습니다.');
                }
            }, 500);
        }

    } catch (e) {
        console.error('[Auth] 후처리 실패:', e.message);
        document.getElementById('loginStatus').textContent = '사용자 정보 로드 실패: ' + e.message;
        showLoginScreen();
    }
}
