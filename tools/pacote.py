#!/usr/bin/env python3
"""Monta PACOTE_MESTRE_DO_CANAL.zip e PACOTE_NARRACOES-N.zip na raiz do repositório.

Uso (da raiz):  python3 tools/pacote.py

Leva tudo o que é leve e necessário para continuar o canal em outra conta:
arquivo mestre, regras, catálogo, ideias, ferramentas, artes do canal e, em cada
vídeo, textos, código da animação, narração e sincronia, thumbnails e QA.
Deixa de fora vídeos (.mov/.mp4), áudio final (.wav), imagens de revisão
(folhas/, preview/, cenas/) e o teste do CapCut. Para avisar se passar de 95 MB
(limite prático do GitHub é 100 MiB por arquivo).

Desde a versão 13 do arquivo mestre (vídeo 10), as narrações (audio/*.mp3) ficam
fora do pacote principal, em PACOTE_NARRACOES-1.zip, -2.zip..., cada um com até
~90 MB. A divisão segue a ordem dos vídeos, então os pacotes antigos não mudam
quando entra um vídeo novo (ele cai no último ou abre um novo).
"""
import os
import sys
import zipfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'PACOTE_MESTRE_DO_CANAL.zip')
PASTA_NO_ZIP = 'PACOTE_MESTRE_DO_CANAL'
LIMITE = 95 * 1000 * 1000
LIMITE_NARRACOES = 90 * 1000 * 1000

ARQUIVOS_RAIZ = ['ARQUIVO_MESTRE_DO_CANAL.md', 'README.md', 'catalogo-visual.md']
PASTAS_INTEIRAS = ['.kiro/steering', 'ideias', 'tools', 'canal']
FORA_DE_CANAL = ['canal/teste-capcut']
PASTAS_FORA = {'folhas', 'preview', 'cenas', 'node_modules', '.git'}
EXT_FORA = {'.mov', '.mp4', '.wav', '.zip'}
SAIDA_OK = ('thumb', 'storyboard', 'qa.txt')


def arquivos():
    lista = [f for f in ARQUIVOS_RAIZ if os.path.isfile(os.path.join(RAIZ, f))]
    for pasta in PASTAS_INTEIRAS:
        for base, dirs, nomes in os.walk(os.path.join(RAIZ, pasta)):
            rel_base = os.path.relpath(base, RAIZ)
            dirs[:] = [d for d in sorted(dirs)
                       if d not in PASTAS_FORA and os.path.join(rel_base, d) not in FORA_DE_CANAL]
            for n in sorted(nomes):
                if os.path.splitext(n)[1].lower() not in EXT_FORA:
                    lista.append(os.path.join(rel_base, n))
    for video in sorted(d for d in os.listdir(RAIZ) if d.startswith('video-')):
        vpasta = os.path.join(RAIZ, video)
        for n in sorted(os.listdir(vpasta)):
            if os.path.isfile(os.path.join(vpasta, n)) and os.path.splitext(n)[1] in ('.md', '.txt'):
                lista.append(os.path.join(video, n))
        for sub in ('animacao', 'audio'):
            spasta = os.path.join(vpasta, sub)
            if os.path.isdir(spasta):
                for n in sorted(os.listdir(spasta)):
                    if os.path.isfile(os.path.join(spasta, n)) and os.path.splitext(n)[1].lower() not in EXT_FORA:
                        lista.append(os.path.join(video, sub, n))
        spasta = os.path.join(vpasta, 'saida')
        if os.path.isdir(spasta):
            for n in sorted(os.listdir(spasta)):
                if os.path.isfile(os.path.join(spasta, n)) and n.startswith(SAIDA_OK):
                    lista.append(os.path.join(video, 'saida', n))
    return lista


def eh_narracao(f):
    partes = f.replace(os.sep, '/').split('/')
    return len(partes) == 3 and partes[0].startswith('video-') and partes[1] == 'audio' and f.lower().endswith('.mp3')


def zipar(destino, pasta_no_zip, lista, conteudo):
    tmp = destino + '.tmp'
    with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.writestr(pasta_no_zip + '/CONTEUDO_DO_PACOTE.txt', '\n'.join(conteudo) + '\n')
        for f in lista:
            z.write(os.path.join(RAIZ, f), pasta_no_zip + '/' + f.replace(os.sep, '/'))
    with zipfile.ZipFile(tmp) as z:
        ruim = z.testzip()
        if ruim:
            sys.exit('arquivo corrompido no zip: ' + ruim)
    os.replace(tmp, destino)
    return os.path.getsize(destino)


def narracoes(lista):
    grupos, atual, soma = [], [], 0
    for f in lista:
        t = os.path.getsize(os.path.join(RAIZ, f))
        if atual and soma + t > LIMITE_NARRACOES:
            grupos.append(atual); atual, soma = [], 0
        atual.append(f); soma += t
    if atual:
        grupos.append(atual)
    nomes = []
    for i, g in enumerate(grupos, 1):
        nome = 'PACOTE_NARRACOES-%d.zip' % i
        conteudo = ['Narrações originais do dono (parte %d de %d). Descompacte junto com o PACOTE_MESTRE_DO_CANAL:' % (i, len(grupos)),
                    'cada arquivo volta para video-NN-<tema>/audio/narracao.mp3.', '']
        conteudo += ['%10.1f  %s' % (os.path.getsize(os.path.join(RAIZ, f)) / 1024, f) for f in g]
        tam = zipar(os.path.join(RAIZ, nome), 'PACOTE_MESTRE_DO_CANAL', g, conteudo)
        print('%s: %d narrações, %.1f MB' % (nome, len(g), tam / 1e6))
        nomes.append((nome, g))
    for velho in os.listdir(RAIZ):
        if velho.startswith('PACOTE_NARRACOES-') and velho.endswith('.zip') and velho not in [n for n, _ in nomes]:
            os.remove(os.path.join(RAIZ, velho))
    return nomes


def main():
    todos = arquivos()
    lista = [f for f in todos if not eh_narracao(f)]
    nomes = narracoes([f for f in todos if eh_narracao(f)])
    total = sum(os.path.getsize(os.path.join(RAIZ, f)) for f in lista)
    conteudo = ['Conteúdo do pacote (caminho e tamanho em KB). Veja a seção 11 do ARQUIVO_MESTRE_DO_CANAL.md',
                'para o que ficou de fora e onde está.', '']
    conteudo += ['%10.1f  %s' % (os.path.getsize(os.path.join(RAIZ, f)) / 1024, f) for f in lista]
    conteudo += ['', '%d arquivos, %.1f MB antes de compactar' % (len(lista), total / 1e6), '',
                 'As narrações (audio/narracao.mp3 de cada vídeo) estão em pacotes separados:']
    conteudo += ['  %s: %s' % (n, ', '.join(f.split(os.sep)[0] for f in g)) for n, g in nomes]
    tam = zipar(SAIDA, PASTA_NO_ZIP, lista, conteudo)
    with open(os.path.join(RAIZ, 'CONTEUDO_DO_PACOTE.txt'), 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(conteudo) + '\n')
    print('%s: %d arquivos, %.1f MB' % (os.path.relpath(SAIDA, RAIZ), len(lista) + 1, tam / 1e6))
    if tam > LIMITE:
        sys.exit('ATENÇÃO: passou de 95 MB; o GitHub pode recusar. Tire algo do pacote.')


if __name__ == '__main__':
    main()
