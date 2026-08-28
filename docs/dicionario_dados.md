# Dicionário de Dados — CardioIA

Este documento descreve as 10 variáveis do dataset [`cardioia_dataset_numerico.csv`](../data/cardioia_dataset_numerico.csv). Cada linha do arquivo representa um exame de ECG e suas informações numéricas e clínicas associadas.

## Variáveis

| Variável | Tipo | Unidade ou domínio | Origem | Descrição |
|---|---|---|---|---|
| `ecg_id` | Inteiro | Número inteiro positivo | PTB-XL | Identificador do exame no PTB-XL. É a chave que permite relacionar o registro numérico ao ECG correspondente no conjunto de imagens. |
| `idade_anos` | Inteiro | Anos | PTB-XL | Idade registrada no momento do exame. Nesta amostra, varia de 18 a 89 anos. |
| `sexo` | Categórico | `F` ou `M` | PTB-XL | Sexo registrado na base de origem. `F` representa feminino e `M` representa masculino. |
| `pressao_arterial_mmhg` | Texto numérico composto | `sistólica/diastólica`, em mmHg | Simulada | Pressão arterial no formato `120/80`. O primeiro valor representa a pressão sistólica e o segundo, a diastólica. |
| `colesterol_total_mg_dl` | Inteiro | mg/dL | Simulada | Concentração simulada de colesterol total no sangue. Nesta amostra, varia de 133 a 280 mg/dL. |
| `historico_doenca_cardiaca` | Binário | `0` ou `1` | Simulada | Indica histórico de doença cardíaca. `1` significa que há histórico; `0`, que não há histórico informado no cenário simulado. |
| `sintomas` | Categórico textual | `Nenhum`, `Dor no peito`, `Dispneia`, `Palpitacoes`, `Sincope` ou combinação desses sintomas | Simulada | Sintomas cardiovasculares simulados associados ao registro. Quando existe mais de um, os valores são separados por ponto e vírgula. |
| `frequencia_cardiaca_bpm` | Inteiro | Batimentos por minuto (bpm) | Simulada | Frequência cardíaca simulada no momento do exame. Nesta amostra, varia de 42 a 117 bpm. |
| `classe_ecg` | Categórico | `NORM`, `MI`, `STTC`, `CD` ou `HYP` | PTB-XL | Superclasse cardiológica atribuída ao ECG. Pode ser usada como rótulo em experimentos acadêmicos de classificação. |
| `glicemia_jejum_mg_dl` | Inteiro | mg/dL | Simulada | Concentração simulada de glicose no sangue em jejum. Nesta amostra, varia de 67 a 192 mg/dL. |

## Classes do ECG

| Código | Significado |
|---|---|
| `NORM` | ECG normal |
| `MI` | Infarto do miocárdio |
| `STTC` | Alterações do segmento ST ou da onda T |
| `CD` | Distúrbio de condução |
| `HYP` | Hipertrofia cardíaca |

## Convenções importantes

- O dataset possui 120 registros e 10 variáveis.
- `ecg_id`, `idade_anos`, `sexo` e `classe_ecg` foram obtidos dos metadados do PTB-XL.
- As demais variáveis clínicas foram simuladas para atender ao objetivo acadêmico da atividade.
- Não existem células vazias no arquivo atual.
- A coluna `pressao_arterial_mmhg` deve ser dividida pelo caractere `/` caso seja necessário analisar separadamente pressão sistólica e diastólica.
- Os valores simulados não devem ser usados para diagnóstico ou tomada de decisão médica.

## Fonte

- PTB-XL v1.0.3: https://physionet.org/content/ptb-xl/1.0.3/
- Repositório visual de referência: https://github.com/RivandoNeto/CardioIA

