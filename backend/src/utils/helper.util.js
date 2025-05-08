function emptyOrRows(rows) {
  if (!rows) {
    return [];
  }
  return rows;
}

function validID(id) {
  if(!id){
    return false
  }
  return !isNaN(id)
}

function formatSchedule(rows) {
  const result = {};

  for (const row of rows) {
    const { id, date, theatre_name, start_time, available } = row;

    if (!result[date]) result[date] = {};
    if (!result[date][theatre_name]) result[date][theatre_name] = {};
    result[date][theatre_name][start_time] = { available, scheduleId: id };
  }

  return result;
}

function formatSeats(data) {
  const result = {};

  for (const seat of data) {
    const zone = seat.zone_name;
    const row = seat.row;
    const seatId = seat.seat_id;

    if (!result[zone]) {
      result[zone] = {};
    }

    if (!result[zone][row]) {
      result[zone][row] = {};
    }

    result[zone][row][seatId] = {
      isSpacer: !!seat.is_spacer,
      available: !!seat.available,
      row: seat.row,
      column: seat.column
    };
  }

  for (const zone of Object.keys(result)) {
    for (const row of Object.keys(result[zone])) {
      const sortedSeats = Object.entries(result[zone][row])
        .sort(([, a], [, b]) => a.column - b.column)
        .reduce((acc, [seatId, info]) => {
          acc[seatId] = info;
          return acc;
        }, {});

      result[zone][row] = sortedSeats;
    }
  }

  return result;
}

module.exports = {
  emptyOrRows,
  validID,
  formatSchedule,
  formatSeats
}