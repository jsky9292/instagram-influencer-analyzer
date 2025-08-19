import time
import os
from DrissionPage import ChromiumPage, ChromiumOptions
from DrissionPage.common import Actions
import random
from openpyxl import Workbook
from typing import List, Dict

SAVE_PATH = "shein_products.xlsx"
CATEGORY_URL = "https://kr.shein.com/Women-Clothing-c-2030.html?fromPageType=home&src_module=all&src_identifier=on%3DIMAGE_COMPONENT%60cn%3Dshopbycate%60hz%3D-%60jc%3Dreal_2030%60ps%3D2_9&src_tab_page_id=page_home1752652925920&ici=CCCSN%3Dall_ON%3DIMAGE_COMPONENT_OI%3D82381186_CN%3DONE_IMAGE_COMPONENT_TI%3D50001_aod%3D0_PS%3D2-9_ABT%3D0"

def get_all_product_links(page: ChromiumPage, max_page=50) -> List[str]:
    links = set()
    for page_num in range(1, max_page+1):
        url = CATEGORY_URL + f"&page={page_num}"
        print(f"[{page_num}] 페이지 로드중: {url}")
        page.get(url)
        time.sleep(random.uniform(2, 3))  # 페이지 로드 후 딜레이

        ac = Actions(page)
        for _ in range(12):
            ac.scroll(delta_y=2200)
            time.sleep(random.uniform(0.7, 1.1))

        # 셀렉터 패치: 더 폭넓게 탐색
        cards = page.eles('css:div.product-card, div.S-product-card')
        print(f"  → 상품카드 {len(cards)}개 발견")
        for idx, card in enumerate(cards, 1):
            # 이미지 a태그를 좀 더 유연하게 탐색
            a = card.ele('css:a.S-product-card__img-container, a')
            print(f"    [{idx}] a: {a}, href: {a.attr('href') if a else None}")
            if not a:
                continue
            href = a.attr('href')
            if href and href.startswith('/'):
                links.add('https://kr.shein.com' + href)
            elif href and href.startswith('http'):
                links.add(href)
        # 종료조건
        if not cards:
            print(f"상품 카드 더이상 없음. {page_num-1}페이지에서 종료")
            break
    print(f"총 {len(links)}개 상품 링크 수집됨")
    return list(links)

def get_product_detail(page: ChromiumPage, url: str) -> Dict:
    page.get(url)
    # 가장 먼저 상품명이 나올 때까지 기다림
    try:
        name = page.ele('css:h1.product-intro__head-name', timeout=10).text
    except:
        print(f"[오류] 상품명 못 찾음: {url}")
        return {}

    # 가격 - 여러 패턴을 시도
    price = ""
    price_selectors = [
        '.product-intro__head-price .original',
        '.product-intro__head-price .product-intro__head-price_now',
        '.product-intro__head-price span',
        '.product-intro__head-price',
    ]
    for sel in price_selectors:
        try:
            price = page.ele(f'css:{sel}').text
            if price:
                break
        except:
            continue

    # 브랜드
    try:
        brand = page.ele('css:.product-intro__head-brand').text
    except:
        brand = ""

    # 상세설명
    try:
        desc = page.ele('css:.product-intro__description').text
    except:
        desc = ""

    # 이미지 (data-src, src 모두 시도)
    images = []
    for img in page.eles('css:.product-intro__thumbs img, .product-intro__thumbs .j-verlok-lazy'):
        src = img.attr('src') or img.attr('data-src')
        if src and src.startswith('http'):
            images.append(src)
    # 그래도 없으면 style에서 뽑기
    if not images:
        for div in page.eles('css:.product-intro__thumbs div[style]'):
            style = div.attr('style')
            if style and 'background-image' in style:
                url_part = style.split('url(')[-1].split(')')[0].replace('"', '').replace("'", "")
                if url_part.startswith('http'):
                    images.append(url_part)

    return {
        '상품명': name,
        '가격': price,
        '브랜드': brand,
        '상세설명': desc,
        '이미지들': ','.join(images),
        '상세페이지': url
    }

def save_to_excel(products: List[Dict], filename: str = SAVE_PATH):
    wb = Workbook()
    ws = wb.active
    headers = ['상품명', '가격', '브랜드', '상세설명', '이미지들', '상세페이지']
    ws.append(headers)
    for prod in products:
        ws.append([prod.get(h, "") for h in headers])
    wb.save(filename)
    print(f"저장 완료: {filename}")

def main():
    opts = ChromiumOptions()
    opts.headless(False)
    opts.set_argument('--no-sandbox')
    opts.set_argument('--window-size=1920,1080')
    opts.set_user_agent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36')
    page = ChromiumPage(opts)
    links = get_all_product_links(page, max_page=1)  # 1페이지만!

    # Workbook/Sheet 준비
    wb = Workbook()
    ws = wb.active
    headers = ['상품명', '가격', '브랜드', '상세설명', '이미지들', '상세페이지']
    ws.append(headers)
    wb.save(SAVE_PATH)  # 헤더만 먼저 저장 (선택)

    for idx, url in enumerate(links, 1):
        print(f"{idx}/{len(links)} 상세정보 수집: {url}")
        detail = get_product_detail(page, url)
        if detail:
            ws.append([detail.get(h, "") for h in headers])
            wb.save(SAVE_PATH)  # ★★★ row 추가될 때마다 바로 저장!
        time.sleep(1.5)

    print(f"전체 {len(links)}개 상품 완료!")

if __name__ == "__main__":
    main()