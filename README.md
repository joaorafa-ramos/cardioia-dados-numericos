# CardioIA — Fase 1: Dados Numéricos (IoT)

Entrega da Parte 1 da Fase **Batimentos de Dados**: uma base numérica de pacientes cardíacos preparada para análises e experimentos acadêmicos de Inteligência Artificial.

---

## 1. O que foi entregue

| Item | Valor |
|---|---|
| Quantidade | 120 registros |
| Número de variáveis | 10 |
| Formato principal | CSV |
| Fonte dos metadados | PTB-XL v1.0.3 — PhysioNet |
| Natureza da base | Híbrida: metadados reais e variáveis clínicas simuladas |

### Link para os dados

- [Dataset numérico em CSV](data/cardioia_dataset_numerico.csv)
- [Versão organizada em Excel](outputs/01a04669-29ce-7d82-b018-ed0c06525e78/cardioia_dataset_numerico.xlsx)
- [Dicionário de dados](docs/dicionario_dados.md)

Depois que o repositório for publicado no GitHub, esses arquivos poderão ser acessados diretamente pela equipe da FIAP. Antes da entrega, os links devem ser testados em uma janela anônima.

---

## 2. Origem e integração com o projeto

O dataset foi construído a partir do manifesto de ECGs usado no repositório [RivandoNeto/CardioIA](https://github.com/RivandoNeto/CardioIA). Esse manifesto possui 120 exames derivados do **PTB-XL**, com informações reais de idade, sexo, classe cardiológica e identificador do ECG.

Cada linha desta base mantém o `ecg_id` original, permitindo relacionar os dados numéricos ao exame correspondente da parte visual do CardioIA.

As informações de pressão arterial, colesterol, histórico de doença cardíaca, sintomas, frequência cardíaca e glicemia não estavam disponíveis no manifesto. Por isso, foram simuladas de maneira determinística para atender ao objetivo acadêmico da atividade.

Fonte primária: [PTB-XL v1.0.3 — PhysioNet](https://physionet.org/content/ptb-xl/1.0.3/).

---

## 3. Variáveis do dataset

| Variável | Tipo | Descrição |
|---|---|---|
| `ecg_id` | Inteiro | Identificador do ECG no PTB-XL e chave de ligação com as imagens. |
| `idade_anos` | Inteiro | Idade do paciente no momento do exame. |
| `sexo` | Categoria | Sexo registrado na fonte (`F` ou `M`). |
| `pressao_arterial_mmhg` | Texto numérico | Pressão sistólica e diastólica no formato `120/80`, em mmHg. |
| `colesterol_total_mg_dl` | Inteiro | Colesterol total simulado, em mg/dL. |
| `historico_doenca_cardiaca` | Binário | `1` indica histórico e `0` indica ausência de histórico. |
| `sintomas` | Categoria | Sintomas simulados: dor no peito, dispneia, palpitações, síncope ou nenhum. |
| `frequencia_cardiaca_bpm` | Inteiro | Frequência cardíaca simulada, em batimentos por minuto. |
| `classe_ecg` | Categoria | Superclasse do ECG: `NORM`, `MI`, `STTC`, `CD` ou `HYP`. |
| `glicemia_jejum_mg_dl` | Inteiro | Glicemia de jejum simulada, em mg/dL. |

As três variáveis adicionais selecionadas foram:

- **`ecg_id`**, porque permite integrar o dataset aos exames do repositório do projeto;
- **`classe_ecg`**, porque pode funcionar como rótulo em experimentos de classificação;
- **`glicemia_jejum_mg_dl`**, por sua relação com diabetes e risco cardiovascular.

A pressão arterial ocupa uma única variável para manter o limite de dez colunas, mas preserva seus dois componentes clínicos no formato sistólica/diastólica.

---

## 4. Variáveis mais relevantes clinicamente

**Pressão arterial:** pode auxiliar na identificação de padrões relacionados à hipertensão, um dos principais fatores associados a complicações cardiovasculares.

**Colesterol total:** ajuda a representar risco de formação de placas nas artérias e pode ser relacionado a doenças coronarianas.

**Frequência cardíaca:** é especialmente importante para aplicações de IoT, pois pode ser coletada continuamente por sensores e dispositivos vestíveis.

**Sintomas e histórico de doença cardíaca:** fornecem contexto clínico para os sinais numéricos e ajudam a diferenciar pacientes assintomáticos de casos que precisam de maior atenção.

**Classe do ECG:** permite relacionar as informações numéricas às cinco categorias presentes na parte visual do projeto.

---

## 5. Possíveis aplicações em Inteligência Artificial

- análise das distribuições de idade, pressão, colesterol, glicemia e frequência cardíaca;
- comparação das variáveis entre as cinco classes de ECG;
- identificação de valores atípicos;
- classificação acadêmica das classes cardiológicas;
- integração entre dados tabulares e imagens utilizando o `ecg_id`.

Os valores clínicos simulados servem apenas para estudo e prototipagem. Não devem ser utilizados para diagnóstico ou decisão médica.

---

## 6. Estrutura do repositório

```text
cardioia-dados-numericos/
├── README.md
├── data/
│   ├── cardioia_dataset_numerico.csv
│   └── source/
│       └── manifest_ecg_ptbxl.csv
├── docs/
│   └── dicionario_dados.md
├── outputs/
│   └── 01a04669-29ce-7d82-b018-ed0c06525e78/
│       └── cardioia_dataset_numerico.xlsx
└── scripts/
    └── gerar_dataset.mjs
```

## 7. Reprodução

Com Node.js 18 ou superior:

```bash
node scripts/gerar_dataset.mjs
```

O script recria o CSV com a mesma semente aleatória (`42`).
