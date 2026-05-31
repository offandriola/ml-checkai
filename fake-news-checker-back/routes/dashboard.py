from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

# Ajuste o import do banco caso o seu "get_db" esteja em outro lugar (geralmente fica em api.database)
from database import get_db 
from db_models.verificacao import Verificacao

# Cria o router para os endpoints do dashboard
router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])

@router.get("/resumo")
def obter_resumo(db: Session = Depends(get_db)):
    """Retorna os totais de verificações para os cards do topo."""
    total = db.query(Verificacao).count()
    
    # Faz um GROUP BY no banco para contar os status
    resultados = db.query(
        Verificacao.resultado, 
        func.count(Verificacao.id)
    ).group_by(Verificacao.resultado).all()
    
    # Transforma o resultado do banco num dicionário fácil de ler
    contagem = dict(resultados)
    
    return {
        "total": total,
        "verdadeiras": contagem.get("REAL", 0),
        "falsas": contagem.get("FALSO", 0),
        "inconclusivas": contagem.get("INCONCLUSIVO", 0)
    }

@router.get("/ultimas")
def obter_ultimas_verificacoes(db: Session = Depends(get_db)):
    """Retorna as 5 verificações mais recentes."""
    ultimas = db.query(Verificacao).order_by(Verificacao.criado_em.desc()).limit(5).all()
    
    return [
        {
            "id": v.id,
            # Corta o texto se for muito grande para não quebrar o layout
            "texto": v.texto_verificado[:60] + "..." if len(v.texto_verificado) > 60 else v.texto_verificado,
            "resultado": v.resultado,
            "confianca": v.confianca,
            "data": v.criado_em.isoformat()
        } for v in ultimas
    ]

@router.get("/fontes-top")
def obter_fontes_top():
    """
    MOCK: Retorna fontes fictícias pois a coluna 'fonte' 
    ainda não existe na tabela 'verificacoes'.
    """
    return [
        {"nome": "Exame Brasil", "url": "exame.com", "total": 34},
        {"nome": "Agência Brasil", "url": "agenciabrasil.gov.br", "total": 28},
        {"nome": "G1 - Globo", "url": "g1.globo.com", "total": 22}
    ]