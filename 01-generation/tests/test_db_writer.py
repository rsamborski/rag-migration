import pytest
from unittest.mock import MagicMock, patch
import src.db_writer
from src.db_writer import write_products_to_alloydb


def test_write_products_success():
    # Mock data
    products = [
        {
            "id": 101,
            "name": "Product X",
            "category": "Category X",
            "brand": "Brand X",
            "retail_price": 99.99,
        }
    ]
    embeddings = [[0.1] * 768]  # Mock 1 embedding with 768 dimensions

    # Mock SQLAlchemy Session and Engine
    mock_session = MagicMock()
    mock_sessionmaker = MagicMock(return_value=mock_session)
    mock_engine = MagicMock()

    with patch("src.db_writer.init_db_engine", return_value=mock_engine), patch(
        "src.db_writer.sessionmaker", return_value=mock_sessionmaker
    ):

        # We need a context manager for the session mock
        mock_session.__enter__.return_value = mock_session

        success = write_products_to_alloydb(products, embeddings)

        assert success is True
        # Verify that add or execute was called on the session
        # We'll refine this assertion based on whether we use ORM or core SQL
        assert (
            mock_session.execute.called
            or mock_session.add_all.called
            or mock_session.add.called
        )
        mock_session.commit.assert_called_once()


def test_write_products_mismatched_lengths():
    products = [{"id": 1}]
    embeddings = []  # Mismatch

    with pytest.raises(ValueError):
        write_products_to_alloydb(products, embeddings)


def test_write_products_empty():
    assert write_products_to_alloydb([], []) is True


def test_write_products_exception():
    products = [{"id": 1}]
    embeddings = [[0.1] * 768]

    mock_session = MagicMock()
    mock_session.__enter__.return_value = mock_session
    mock_session.execute.side_effect = Exception("DB Error")
    mock_sessionmaker = MagicMock(return_value=mock_session)

    with patch("src.db_writer.init_db_engine"), patch(
        "src.db_writer.sessionmaker", return_value=mock_sessionmaker
    ):

        success = write_products_to_alloydb(products, embeddings)
        assert success is False


def test_init_db_engine():
    with patch("src.db_writer.Connector"), patch(
        "src.db_writer.sqlalchemy.create_engine"
    ) as mock_create_engine:

        engine = src.db_writer.init_db_engine()
        assert mock_create_engine.called
