from ipaddress import collapse_addresses
from tabnanny import check
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import csv
import mysql.connector

pils = 1
speciaalbier = 2
cola = 3
fanta = 4
cassis = 5
anders = 6
radler = 7
liefmans = 8

types = [
    ['https://producten.makro.nl/shop/pv/BTY-X761791/0032/0021/Fanta-Orange-sleek-can-12-x-33-cl', ['Fanta', 12, fanta]], 
    ['https://producten.makro.nl/shop/pv/BTY-X761790/0032/0021/Coca-Cola-zero-sugar-sleek-can-12-x-33-cl', ['Cola', 12, cola]], 
    ['https://producten.makro.nl/shop/pv/BTY-X761786/0032/0021/Fanta-Orange', ['Fanta tray', 24, fanta]], 
    ['https://producten.makro.nl/shop/pv/BTY-X761784/0032/0021/Coca-Cola-Zero-Sugar', ['Cola tray', 24, cola]],
    ['https://producten.makro.nl/shop/pv/BTY-X761785/0032/0021/Fanta-Cassis-Blik-0.33L-1x', ['Cassis tray', 24, cassis]],
    ['https://producten.makro.nl/shop/pv/BTY-X628589/0032/0021/Hertog-Jan-Pilsener-Bier-Fles-30-cl', ['Pils', 24, pils]],
    ['https://producten.makro.nl/shop/pv/BTY-X251314/0032/0021/La-Trappe-Tripel-fles-8-x-330-ml', ['La Trappe Tripel', 8, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X251327/0032/0021/LATRAPPE-QUADRUPEL-BIER-FLES-33CL', ['La Trappe Quadrupel', 8, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X142731/0032/0021/Westmalle-Trappist-Tripel-Flessen-8-x-33-cl', ['Westmalle Tripel', 8, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X679468/0032/0021/Liefmans-Fruitesse-4-x-25-cl', ['Liefmans', 4, liefmans]],
    ['https://producten.makro.nl/shop/pv/BTY-X745508/0032/0021/Liefmans-Fruitesse-Alcoholvrij-0.0-4-pack', ['Liefmans 0.0', 4, liefmans]],
    ['https://producten.makro.nl/shop/pv/BTY-X746346/0032/0021/Liefmans-fruitesse-blik-4-x-25-cl', ['Liefmans blik', 4, liefmans]],
    ['https://producten.makro.nl/shop/pv/BTY-X736775/0032/0021/Hertog-Jan-Grand-Prestige-Bier-Flessen-6-x-30-cl', ['Hertog Jan Grand Prestige', 6, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X628594/0032/0027/Hertog-Jan-Weizener-Witbier-Flessen-6-x-30-cl', ['Hertog Jan Weizener', 6, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X736778/0032/0021/Hertog-Jan-Tripel-Bier-Flessen-6-x-30-cl', ['Hertog Jan Tripel', 6, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X547476/0032/0023/Hertog-Jan-Lentebock-Bier-Flessen-6-x-30-cl', ['Hertog Jan Lentebock', 6, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X628617/0032/0023/Leffe-Blond-Belgisch-Abdijbier-Flessen-6-x-30-cl', ['Leffe Blond', 6, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X628620/0032/0023/Leffe-Tripel-Belgisch-Abdijbier-Flessen-6-x-30-cl', ['Leffe Tripel', 6, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X746000/0032/0021/Leffe-blond-krat-24-x-25-cl', ['Leffe Blond Krat (25cl)', 24, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X744371/0032/0021/Duvel-Belgisch-Speciaalbier-4-x-330-ml', ['Duvel', 4, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X745510/0032/0021/Duvel-6.66-blond-speciaalbier-4-x-33-cl', ['Duvel 666', 4, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X679480/0032/0021/Duvel-fles-33-cl', ['Duvel krat', 24, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X722048/0032/0021/Affligem-Blond-Bier-Fles-6-x-30-cl', ['Affligem Blond', 6, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X672332/0032/0021/Affligem-Tripel-Bier-Fles-6-x-30-cl', ['Affligem Tripel', 6, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X673866/0032/0021/Paulaner-Hefe-Weiss-Bier-Fles-8-x-50-cl', ['Paulaner', 8, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X671975/0032/0021/TRIPLE-KARMELIET-RET-330ML', ['Tripel Karmeliet Krat', 24, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X672357/0032/0021/Tripel-Karmeliet-Belgisch-Speciaalbier-Flessen-4-x-33-cl', ['Tripel Karmeliet', 4, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X697691/0032/0021/Weihenstephaner-Hefeweissbier-fles-8-x-50-cl', ['Weihenstephaner', 8, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X54700/0032/0021/Franziskaner-Weissbier-Premium-Naturtr%C3%BCb-Flaschen-20-x-0-5-L', ['Franziskaner Krat', 20, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X545279/0032/0021/Franziskaner-Weissbier-Naturtr%C3%BCb-Premium-Hefe-Weissbier-Blikken-8-x-0-5-L', ['Franziskaner Blik', 8, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X679478/0032/0021/Chouffe-La-Blonde-4-x-330-ml', ['La Chouffe', 4, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X231329/0032/0021/Grimbergen-Blond-Speciaalbier-30cl-fles', ['Grimbergen Blond', 6, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X231342/0032/0021/Grimbergen-Tripel-Speciaalbier-30cl-fles', ['Grimbergen Tripel', 6, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X672366/0032/0021/Kasteel-donker-fles-4-x-33-cl', ['Kasteel Donker', 4, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X636042/0032/0021/Kasteel-11%C2%B0-Tripel-Belgisch-Bier-Flessen-4-x-33-cl', ['Kasteel Tripel', 4, speciaalbier]],
    ['https://producten.makro.nl/shop/pv/BTY-X671804/0032/0021/Amstel-Radler-0.0-Bier-Citroen-Fles-6-x-30-cl', ['Radler', 6, radler]],
    ['https://producten.makro.nl/shop/pv/BTY-X244423/0032/0021/Amstel-Radler-0.0-Bier-Citroen-Blik-6-x-33-cl', ['Radler blik', 6, radler]]
]

def findSodaPromotion(url, type, writer, driver, cursor):
    driver.get(url)
    driver.switch_to.default_content()
    try:
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'primary'))
        )

        priceDiv = driver.find_element(By.CLASS_NAME, 'mfcss_article-detail--price-container')
        prices = priceDiv.find_element(By.CLASS_NAME, "promotion")
        amounts = priceDiv.find_elements(By.CLASS_NAME, 'mfcss_article-detail--price-breakdown')

        cost = 0
        for amount in amounts:
            checkAmount = amount.find_element(By.TAG_NAME, 'span').text
            if 'incl. btw' in checkAmount:
                checkAmount = checkAmount.replace(" incl. btw", "")
                checkAmount = checkAmount.replace("€ ", "")
                checkAmount = checkAmount.replace(",", ".")
                cost  = float(checkAmount)
                break
        
        if cost != 0:
            formaat = ""
            if type[1] == 12:
                formaat = '12 pack'
            elif type[1] == 24:
                if type[2] == fanta or type[2] == cassis or type[2] == cola:
                    formaat = 'Tray'
                else:
                    formaat = 'krat'
            elif type[1] == 6:
                formaat = "Sixpack"
            elif type[1] == 4:
                formaat = "Fourpack"
            elif type[1] == 8:
                formaat = "8 pack"
            elif type[1] == 20:
                formaat = 'Krat'

            writer.writerow({'type': type[2], 'winkel': 'Makro', 'merk': type[0], 'prijs': cost, 'formaat': formaat, 'stuk_prijs': round(cost/type[1], 2), 'korting': 0})
            query = "INSERT INTO offers (type, winkel, merk, prijs, formaat, stukPrijs, korting) VALUES(%s, %s, %s, %s, %s, %s, %s)"
            vals = (type[2], 'Makro', type[0], cost, formaat, round(cost/type[1], 2), 0)
            cursor.execute(query, vals)
            print(type[0] + " aanbieding!")
            print("€" + str(cost))       
            print("€" + str(round(cost/type[1], 2)) + " per stuk")
    except:
        print("Geen aanbiedingen voor " + type[0])

def getBeerPromotions(writer, driver, cursor):   #Header schrijven
    offersDone = False
    print("Aanbiedingen ophalen...")
    #driver = webdriver.Chrome('/usr/bin/chromedriver', options=chrome_options)
    #driver = webdriver.Firefox()   #Webdriver starten vanaf de juiste locatie met de juiste options
    #Navigeren naar Biernet, met alle filters toegepast
    driver.get('https://www.biernet.nl/bier/aanbiedingen/merk:amstel-radler-00+affligem+brugse-zot+de-leckere+delirium+grimbergen+kasteel+leffe+st-bernardus+straffe-hendrik+texels+hertog-jan+chimay+la-trappe+duvel+la-chouffe+pauwel-kwak+tripel-karmeliet+westmalle-tripel/kratten:krat-alle/flessen:4pack-fles-4x0_33+duopack-(2x0_45)+fles-33cl+set-3x0_33+set-4x0_30+sixpack-6x0_25+sixpack-6x0_30+sixpack-6x0_355+sixpack-fles-6x0_33/winkel:albert-heijn+boons-markt+dirk+hoogvliet+plus/percentage:1tm17')

    print("Biernet geladen")
    #driver.switch_to.frame(2)   #Focus wisselen naar het 3e frame (iFrame met de cookies)
    #print("iFrame geselecteerd")
    #driver.find_element_by_css_selector("#buttons > div.btn.green.col-6").click()   #Cookie knop vinden en klikken (Werkt niet altijd)
    #print("Cookies geaccepteerd")
    #driver.switch_to.default_content()  #Focus terug zetten naar de normale site

    global articles
    articles = driver.find_elements(By.CLASS_NAME, "cardStyle")  #Alle aanbiedingen hebben de class cardStyle, daar kan op gezocht worden

    global numArticles
    numArticles = len(articles)-12  #Er staan 12 elementen onderaan de pagina (advertenties etc) met de class cardStyle, die moeten gefiltered worden
    print(str(numArticles) + " aanbiedingen gevonden")

    i = 0
    for article in articles:    #Alle artikelen langsgaan
        try:
            voor_prijs = article.find_element(By.CLASS_NAME, "voor_prijss")   #Eerste artikel heeft voor de prijs de class naam voor_prijss
            van_prijs = article.find_element(By.CLASS_NAME, "van_prijss")
        except NoSuchElementException:
            voor_prijs = article.find_element(By.CLASS_NAME, "voor_prijsss")  #Alle andere artikelen hebben voor de prijs de class naam vor_prijsss
            van_prijs = article.find_element(By.CLASS_NAME, "van_prijsss")
        voor_prijs_text = voor_prijs.text.replace('€', '')    #Euro teken verwijderen, kan niet gelezen worden uit csv door Raspberry Pi
        voor_prijs_text = voor_prijs_text.replace("'", "")    #Aanhalingstekens verwijderen voor het converteren van string naar float
        voor_prijs_text = voor_prijs_text.replace(',', '.')   #Komma vervangen door een punt voor het converteren van string naar float

        van_prijs_text = van_prijs.text.replace('€', '')
        van_prijs_text = van_prijs_text.replace("'", "")
        van_prijs_text = van_prijs_text.replace(',', '.')

        formaat = article.find_element(By.CLASS_NAME, "artikel") #Formaat staat in de class artikel
        formaat_text = formaat.text
        #Alle extra informatie verwijderen of aanpassen, alles wat overblijft is: Fourpack, Sixpack en Krat
        formaat_text = formaat_text.replace(" 6x0,33", "")
        formaat_text = formaat_text.replace(" 6x0,30", "")
        formaat_text = formaat_text.replace(" 4x0,33", "")
        formaat_text = formaat_text.replace("4pack", "Fourpack")
        formaat_text = formaat_text.replace(" 24x0,30", "")
        formaat_text = formaat_text.replace("fles", "")
        formaat_text = formaat_text.replace(' ', '')
        formaat_text = formaat_text.replace('2sixpacks', '2 Sixpacks')
        formaat_text = formaat_text.replace('3sen33cl', '3 Flessen')
        formaat_text = formaat_text.replace('3sixpacks', '3 Sixpacks')
        formaat_text = formaat_text.replace('Set4x0,30', 'Fourpack')

        bier = article.find_element(By.CLASS_NAME, "merkenH3")   #Bier naam vinden
        winkelIcon = article.find_element(By.TAG_NAME, "img")    #Winkels worden niet met tekst weergegeven maar met een plaatje, die wordt eerst gezocht
        winkel = winkelIcon.get_attribute("title")              #Dan wordt de titel gebruikt om de winkel te identificeren

        #Niet alle titels zijn meteen bruikbaar, dus die moeten worden aangepast
        if winkel == "Plus Logo":
            winkel = "Plus"
        elif winkel == "albert heijn":
            winkel = "Albert Heijn"
        elif winkel == "makro":
            winkel = "Makro"
        elif winkel == 'Boon':
            winkel = 'Boons'
        elif winkel == 'Dirk supermarkt':
            winkel = 'Dirk'

        #Aantal flessen in de verpakking achterhalen adhv het formaat voor het berekenen van de prijs per stuk
        numFles = None
        if formaat_text == "Fourpack":
            numFles = 4.0
        elif formaat_text == "Sixpack":
            numFles = 6.0
        elif formaat_text == "Krat":
            numFles = 24.0
        elif formaat_text == "2 Sixpacks":
            numFles = 12.0
        elif formaat_text == "3 Flessen":
            numFles = 3.0
        elif formaat_text == "3 Sixpacks":
            numFles = 18.0
        else:
            numFles = 1.0

        stuk_prijs = float(voor_prijs_text) / numFles    #Prijs omzetten naar float en delen door het aantal flessen voor de prijs per stuk
        stuk_prijs = round(stuk_prijs, 2)   #Prijs afronden naar 2 decimalen

        korting = float(van_prijs_text) - float(voor_prijs_text)
        korting = (korting/float(van_prijs_text))*100
        korting = int(korting)

        writer.writerow({'type': speciaalbier, 'winkel' : winkel, 'merk' : bier.text, 'prijs' : voor_prijs_text, 'formaat' : formaat_text, 'stuk_prijs' : stuk_prijs, 'korting' : korting}) #Alle informatie schrijven naar het csv bestand
        query = "INSERT INTO offers (type, winkel, merk, prijs, formaat, stukPrijs, korting) VALUES(%s, %s, %s, %s, %s, %s, %s)"
        bierType = 0
        if "Pils" in bier.text or "pils" in bier.text:
            bierType = pils
        else:
            bierType = speciaalbier
        
        vals = (bierType, winkel, bier.text, float(voor_prijs_text), formaat_text, stuk_prijs, korting)
        cursor.execute(query, vals)
        print(winkel + ' ' + bier.text + ' ' + voor_prijs_text + ' ' + formaat_text + ' ' + str(stuk_prijs) + ' ' + str(korting) + '%')
        i+=1
        if i == numArticles:    #Alle artikelen zijn bekeken
            break   #For loop stoppen

if __name__ == '__main__':
    mydb = mysql.connector.connect(
        host="192.168.1.71",
        user="root",
        password="H00gr@ven",
        database="barsysteem"
    )
    cursor = mydb.cursor()
    query = ('DELETE IGNORE FROM offers')
    cursor.execute(query)
    mydb.commit()
    with open('aanbiedingen.csv', 'w', newline='') as file:
        fieldnames = ['type', 'winkel', 'merk', 'prijs', 'formaat', 'stuk_prijs', 'korting']
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        driver = webdriver.Firefox()
        driver.get('https://www.makro.nl')
        elem = WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.XPATH, '/html/body/div[2]/footer/div/div/div[3]/div/div/div/div/div/div[2]/button'))
        )
        print("Cookie div geladen")
        driver.find_element(By.XPATH, '/html/body/div[2]/footer/div/div/div[3]/div/div/div/div/div/div[2]/button').click()
        for type in types:
            findSodaPromotion(type[0], type[1], writer, driver, cursor)
        getBeerPromotions(writer, driver, cursor)
        driver.close()
        file.close()
    mydb.commit()