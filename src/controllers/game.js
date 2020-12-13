const uuid = require('uuid')

class GamePiece {
  constructor(color='white', type='pawn', x, y, id) {
    this.id = id || uuid.v4()
    this.color = color
    this.type = type
    this.x = x
    this.y = y
    this.status = 'alive'
  }

  move(x, y) {
    this.x = this.x += x
    this.y = this.y += y
  }

  moveToStatic(x, y) {
    this.x = x
    this.y = y
  }

  getProjectedBoardPosition(x, y) {
    return {
      x: this.x += x,
      y: this.y += y
    }
  }
}

class Game {
  constructor(actions, conditions, layout, pieces, textures, id) {
    this.id = id || uuid.v4()
    this.actions = actions
    this.conditions = conditions
    this.layout = layout
    this.pieces = pieces
    this.textures = textures
    this.board = []
    this.takenPieces = []
    this.activeTurn = 'white',
    this.whiteTurns = 0
    this.blackTurns = 0
  }

  initGame() {
    this.layout.pieces.white.forEach(piece => {
      const boardPieceObj = new GamePiece('white', piece.piece, piece.x, piece.y)
      this.board.push(boardPieceObj)
    })
    this.layout.pieces.black.forEach(piece => {
      const boardPieceObj = new GamePiece('black', piece.piece, piece.x, piece.y)
      this.board.push(boardPieceObj)
    })
  }

  isOutOfBounds(x, y) {
    const boardBoundsX = this.layout.xMax
    const boardBoundsY = this.layout.yMax
    if (x > boardBoundsX || y > boardBoundsY || x < 0 || y < 0) return true
    return false
  }

  getPieceFromCoords(x, y) {
    let foundPiece = this.pieces.find(piece => piece.x === x && piece.y === y)
    return foundPiece
  }

  // Not being used right now
  findPieceFromType(type) {
    let foundPiece = this.pieces.find(piece => piece.type === type)
    return foundPiece
  }

  takePiece(colorTaking, x, y) {
    const piece = this.getPieceFromCoords(x, y)
    if (piece === null) return null
    this.takenPieces.push({
      takenBy: colorTaking,
      ...piece
    })
    this.board = this.board.filter(piece => piece.x !== x && piece.y !== y)
  }

  assessConditions(conditions, piece, x, y) {
    const totalTurns = this.whiteTurns + this.blackTurns,
          whiteTurns = this.whiteTurns,
          blackTurns = this.blackTurns,
          board = this.board,
          getPieceFromCoords = this.getPieceFromCoords

    let pass = true
    conditions.forEach(condition => {
      const equalsIndex = condition.indexOf('='),
            greaterThanIndex = condition.indexOf('>'),
            lessThanIndex = condition.indexOf('<')
      
      let staticPos,
          positionsOccupied,
          occupiedPiece

      // If both = and < or > are detected, check for one after the other
      if (greaterThanIndex !== -1 || lessThanIndex !== -1 && equalsIndex !== -1) {
        if (equalsIndex === greaterThanIndex + 1) {
          // This is an equal to or greater than symbol
          const splitCondition = condition.split('>')

          switch (splitCondition[0]) {
            case 'x':
              if (piece.x < splitCondition[1]) pass = false
              break;
            case 'y':
              if (piece.y < splitCondition[1]) pass = false
              break;
            case 'totalMoves':
              if (totalTurns < splitCondition[1]) pass = false
              break;
            case 'playerMoves':
              if (piece.color === 'white' && whiteTurns < splitCondition[1]) pass = false
              if (piece.color === 'black' && blackTurns < splitCondition[1]) pass = false
              break;
            case 'xRelativeOccupied':
              staticPos = piece.getProjectedBoardPosition(splitCondition[1], 0)
              positionsOccupied = false
              board.forEach(boardPiece => {
                if (boardPiece.x >= staticPos.x) positionsOccupied = true
              })
              if (!positionsOccupied) pass = false
              break;
            case 'yRelativeOccupied':
              staticPos = piece.getProjectedBoardPosition(0, splitCondition[1])
              positionsOccupied = false
              board.forEach(boardPiece => {
                if (boardPiece.y >= staticPos.y) positionsOccupied = true
              })
              if (!positionsOccupied) pass = false
              break;
            case 'xRelativeNotOccupied':
              staticPos = piece.getProjectedBoardPosition(splitCondition[1], 0)
              board.forEach(boardPiece => {
                if (boardPiece.x >= staticPos.x) pass = false
              })
              break;
            case 'yRelativeNotOccupied':
              staticPos = piece.getProjectedBoardPosition(0, splitCondition[1])
              board.forEach(boardPiece => {
                if (boardPiece.y >= staticPos.y) pass = false
              })
              break;
          }
          return pass;
        }
        if (equalsIndex === lessThanIndex + 1) {
          // This is an equal to or less than symbol
          const splitCondition = condition.split('>')
          switch (splitCondition[0]) {
            case 'x':
              if (piece.x > splitCondition[1]) pass = false
              break;
            case 'y':
              if (piece.y > splitCondition[1]) pass = false
              break;
            case 'totalMoves':
              if (totalTurns > splitCondition[1]) pass = false
              break;
            case 'playerMoves':
              if (piece.color === 'white' && whiteTurns > splitCondition[1]) pass = false
              if (piece.color === 'black' && blackTurns > splitCondition[1]) pass = false
              break;
            case 'xRelativeOccupied':
              staticPos = piece.getProjectedBoardPosition(splitCondition[1], 0)
              positionsOccupied = false
              board.forEach(boardPiece => {
                if (boardPiece.x <= staticPos.x) positionsOccupied = true
              })
              if (!positionsOccupied) pass = false
              break;
            case 'yRelativeOccupied':
              staticPos = piece.getProjectedBoardPosition(0, splitCondition[1])
              positionsOccupied = false
              board.forEach(boardPiece => {
                if (boardPiece.y <= staticPos.y) positionsOccupied = true
              })
              if (!positionsOccupied) pass = false
              break;
            case 'xRelativeNotOccupied':
              staticPos = piece.getProjectedBoardPosition(splitCondition[1], 0)
              board.forEach(boardPiece => {
                if (boardPiece.x <= staticPos.x) pass = false
              })
              break;
            case 'yRelativeNotOccupied':
              staticPos = piece.getProjectedBoardPosition(0, splitCondition[1])
              board.forEach(boardPiece => {
                if (boardPiece.y <= staticPos.y) pass = false
              })
              break;
          }
          return pass;
        }
      }

      if (equalsIndex !== -1) {
        // This is an equals symbol
        const splitCondition = condition.split('=')
        switch (splitCondition[0]) {
          case 'x':
            if (piece.x !== splitCondition[1]) pass = false
            break;
          case 'y':
            if (piece.y !== splitCondition[1]) pass = false
            break;
          case 'totalMoves':
            if (totalTurns !== splitCondition[1]) pass = false
            break;
          case 'playerMoves':
            if (piece.color === 'white' && whiteTurns !== splitCondition[1]) pass = false
            if (piece.color === 'black' && blackTurns !== splitCondition[1]) pass = false
            break;
          case 'xRelativeOccupied':
            staticPos = piece.getProjectedBoardPosition(splitCondition[1], 0)
            occupiedPiece = getPieceFromCoords(staticPos.x, staticPos.y)
            if (!occupiedPiece) pass = false
            break;
          case 'yRelativeOccupied':
            staticPos = piece.getProjectedBoardPosition(0, splitCondition[1])
            occupiedPiece = getPieceFromCoords(staticPos.x, staticPos.y)
            if (!occupiedPiece) pass = false
            break;
          case 'xRelativeNotOccupied':
            staticPos = piece.getProjectedBoardPosition(splitCondition[1], 0)
            occupiedPiece = getPieceFromCoords(staticPos.x, staticPos.y)
            if (occupiedPiece) pass = false
            break;
          case 'yRelativeNotOccupied':
            staticPos = piece.getProjectedBoardPosition(0, splitCondition[1])
            occupiedPiece = getPieceFromCoords(staticPos.x, staticPos.y)
            if (occupiedPiece) pass = false
            break;
          case 'onlyOvertake':
            if (splitCondition[1] === true) {
              if (getPieceFromCoords(x, y) === null) pass = false
            } else if (splitCondition[1] === false) {
              if (getPieceFromCoords(x, y) !== null) pass = false
            }
            break;
        }
        return pass;
      }
      if (greaterThanIndex !== -1) {
        // This is a greater than symbol
        const splitCondition = condition.split('>')
        switch (splitCondition[0]) {
          case 'x':
            if (piece.x <= splitCondition[1]) pass = false
            break;
          case 'y':
            if (piece.y <= splitCondition[1]) pass = false
            break;
          case 'totalMoves':
            if (totalTurns <= splitCondition[1]) pass = false
            break;
          case 'playerMoves':
            if (piece.color === 'white' && whiteTurns <= splitCondition[1]) pass = false
            if (piece.color === 'black' && blackTurns <= splitCondition[1]) pass = false
            break;
          case 'xRelativeOccupied':
            staticPos = piece.getProjectedBoardPosition(splitCondition[1], 0)
            positionsOccupied = false
            board.forEach(boardPiece => {
              if (boardPiece.x > staticPos.x) positionsOccupied = true
            })
            if (!positionsOccupied) pass = false
            break;
          case 'yRelativeOccupied':
            staticPos = piece.getProjectedBoardPosition(0, splitCondition[1])
            positionsOccupied = false
            board.forEach(boardPiece => {
              if (boardPiece.y > staticPos.y) positionsOccupied = true
            })
            if (!positionsOccupied) pass = false
            break;
          case 'xRelativeNotOccupied':
            staticPos = piece.getProjectedBoardPosition(splitCondition[1], 0)
            board.forEach(boardPiece => {
              if (boardPiece.x > staticPos.x) pass = false
            })
            break;
          case 'yRelativeNotOccupied':
            staticPos = piece.getProjectedBoardPosition(0, splitCondition[1])
            board.forEach(boardPiece => {
              if (boardPiece.y > staticPos.y) pass = false
            })
            break;
        }
        return pass;
      }
      if (lessThanIndex !== -1) {
        // This is a less than symbol
        const splitCondition = condition.split('>')
        switch (splitCondition[0]) {
          case 'x':
            if (piece.x >= splitCondition[1]) pass = false
            break;
          case 'y':
            if (piece.y >= splitCondition[1]) pass = false
            break;
          case 'totalMoves':
            if (totalTurns >= splitCondition[1]) pass = false
            break;
          case 'playerMoves':
            if (piece.color === 'white' && whiteTurns >= splitCondition[1]) pass = false
            if (piece.color === 'black' && blackTurns >= splitCondition[1]) pass = false
            break;
          case 'xRelativeOccupied':
            staticPos = piece.getProjectedBoardPosition(splitCondition[1], 0)
            positionsOccupied = false
            board.forEach(boardPiece => {
              if (boardPiece.x < staticPos.x) positionsOccupied = true
            })
            if (!positionsOccupied) pass = false
            break;
          case 'yRelativeOccupied':
            staticPos = piece.getProjectedBoardPosition(0, splitCondition[1])
            positionsOccupied = false
            board.forEach(boardPiece => {
              if (boardPiece.y < staticPos.y) positionsOccupied = true
            })
            if (!positionsOccupied) pass = false
            break;
          case 'xRelativeNotOccupied':
            staticPos = piece.getProjectedBoardPosition(splitCondition[1], 0)
            board.forEach(boardPiece => {
              if (boardPiece.x < staticPos.x) pass = false
            })
            break;
          case 'yRelativeNotOccupied':
            staticPos = piece.getProjectedBoardPosition(0, splitCondition[1])
            board.forEach(boardPiece => {
              if (boardPiece.y < staticPos.y) pass = false
            })
            break;
        }
        return pass;
      }
    })
  }

  movePieceToStatic(color, pieceId, x, y) {
    const foundPiece = this.board.find(piece => piece.id === pieceId),
          pieceRules = this.pieces[foundPiece.type][foundPiece.color],
          pieceConditions = this.conditions[pieceRules.condition] || []

    if (color !== foundPiece.color) return {success: false, msg: 'That piece does not belong to you!', piece: foundPiece}

    let possiblePositions = []
    let positionValid = false
    pieceRules.forEach(rule => {
      // Condition assessment
      if (!this.assessConditions(pieceConditions, foundPiece, x, y)) return null;
      

      // If position is outside board
      const ruleProjectedPos = foundPiece.getProjectedBoardPosition(rule.x, rule.y)
      if (this.isOutOfBounds(ruleProjectedPos.x, ruleProjectedPos.y)) return null;

      const overlappingPiece = this.getPieceFromCoords(ruleProjectedPos.x, ruleProjectedPos.y)

      // If there is a piece in the position you want to move, but the allowOvertake rule is set to false
      // Skip adding this move to the possible moves
      if (rule.allowOvertake === false && overlappingPiece !== null) return null;

      // If overlapping piece is the same color, don't allow the move at all
      if (overlappingPiece !== null && overlappingPiece.color === color && rule.canOvertakeOwn !== true) return null; 

      // Add position to list of current possible moves
      possiblePositions.push(ruleProjectedPos)
      // Check if given x and y match this position
      if (ruleProjectedPos.x == x && ruleProjectedPos.y == y) positionValid = true

      if (rule.continuous) {
        let inBounds = true
        let currentRuleLocation = {x: ruleProjectedPos.x + rule.x, y: ruleProjectedPos.y + rule.y}
        while (inBounds) {
          // If position is outside board
          if (this.isOutOfBounds(currentRuleLocation.x, currentRuleLocation.y)) {
            inBounds = false
            break;
          }

          // If there is a piece in the position you want to move, but the allowOvertake rule is set to false
          // Skip adding this move to the possible moves

          const contOverlappingPiece = this.getPieceFromCoords(ruleProjectedPos.x, ruleProjectedPos.y)

          if (rule.allowOvertake === false && contOverlappingPiece !== null) {
            inBounds = false
            break;
          }

          // If overlapping piece is the same color, don't allow the move at all
          if (contOverlappingPiece !== null && contOverlappingPiece.color === color && rule.canOvertakeOwn !== true) return;

          // Add position to list of current possible moves
          possiblePositions.push(currentRuleLocation)
          // Check if given x and y match this position
          if (currentRuleLocation.x == x && currentRuleLocation.y == y) positionValid = true

          // Iterate where to check x and y
          currentRuleLocation.x += rule.x
          currentRuleLocation.y += rule.y
        }
        return;
      }
      return;
    })

    // Check if the given x and y are valid
    if (!positionValid) return {success: false, msg: 'That is an invalid move!', possiblePositions, piece: foundPiece}

    // Remove whatever piece 
    this.takePiece(color, x, y)
    // Move the specified piece
    foundPiece.moveToStatic(x, y)
    
    return {success: true, msg: 'The piece has been successfully moved.', possiblePositions, piece: foundPiece}
  }
}


module.exports = {
  Game,
  GamePiece
}