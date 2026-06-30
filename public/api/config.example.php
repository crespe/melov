<?php
/**
 * 식별 프록시 서버 설정 템플릿.
 * 실제 키를 채운 사본을 같은 디렉토리에 config.php 로 저장한다(절대 커밋 금지).
 * config.php 는 서버에만 존재하며 .gitignore 로 제외된다.
 */
return [
    'gemini_api_key' => 'PUT_KEY_HERE', // Google Generative Language API 키 (AIza...)
    'gemini_model'   => 'gemini-2.5-flash',
];
