import React, { Component } from 'react'
import Checkout from './Checkout'
import { Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function InvoicesAdmin ({
  _id,
  profile,
  invoice,
  users
}) {
  // Display all invoices for admin to see - order by those pending (in chronological order) at the top, followed by those that have been approved (in chronological order), followed by those that have expired, followed by those that have been declined.
  // console.log(JSON.stringify(invoice, null, 2))
  // console.log(JSON.stringify(profile, null, 2))
  profile.forEach((profile, index) => {
    profile['invoices'].forEach((invoice, index) => {
      // const invId = (invoice['_id'])
      // const invId = (invoice['_factoryName'])
      // console.log(invId)
      console.log(profile)
      // const currentProfile = profile.find({'_id': `${variable}`})
      // console.log(currentProfile.factoryName)
    })
  })

  return (
    <div>
      <Table responsive>
        <thead>
          <tr>
            <th>Item No.</th>
            <th>Due Date</th>
            <th>Invoice No.</th>
            <th>End Customer</th>
            <th>Amount</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {
          invoice ? (
            invoice.map((invoice, index) => {
              return (
                <tr>
                  <td>{index + 1}</td>
                  <td>{invoice.dueDate}</td>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.customerCompanyName}</td>
                  <td>{invoice.amount}</td>
                  <td>{invoice.status}</td>
                  <td>
                    <Link to={`/invoice/${invoice._id}`}>
                    View
                    </Link>
                  </td>
                </tr>
                // Repeat the above for approved, expired and declined.
              )
            })) : ('You have no submitted invoices available.')
          }
        </tbody>
      </Table>
    </div>
  )
}
